#!/usr/bin/env python3
"""NCERT Textbook Catalog Extractor.

Extracts and normalizes the full catalog of NCERT textbooks directly from
https://ncert.nic.in/textbook.php.
Preserves official text labels for classes ('Class I'..'Class XII'),
points to the book ZIP archive, and catalogs individual chapter PDF files.
"""

from __future__ import annotations

import html
import json
import logging
import re
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger("ncert_scraper.catalog")

NCERT_URL = "https://ncert.nic.in/textbook.php"
BASE_CDN_URL = "https://ncert.nic.in/textbook/pdf/"
DEFAULT_SEED_FILE = Path(__file__).parent / "catalog_seed.json"
DEFAULT_CATALOG_FILE = Path(__file__).parent / "catalog.json"

ROMAN_TO_NUM = {
    "i": "1",
    "ii": "2",
    "iii": "3",
    "iv": "4",
    "v": "5",
    "vi": "6",
    "vii": "7",
    "viii": "8",
    "ix": "9",
    "x": "10",
    "xi": "11",
    "xii": "12",
}

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


def get_requests_session() -> requests.Session:
    """Create requests session with robust retries and browser headers."""
    session = requests.Session()
    retries = Retry(
        total=4,
        backoff_factor=1.5,
        status_forcelist=[500, 502, 503, 504, 429],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
    })
    return session


def normalize_class_key(raw_class: str) -> str:
    """Normalize class representations (e.g. 'Class X', 'Class 10', '10', 'X') -> '10'."""
    clean = raw_class.lower().replace("class", "").strip()
    if clean in ROMAN_TO_NUM:
        return ROMAN_TO_NUM[clean]
    if clean.isdigit():
        return str(int(clean))
    return clean


def build_chapter_list(
    code: str,
    chapters_str: str,
    class_text: str,
    subject: str,
    title: str,
) -> List[Dict[str, str]]:
    """Enumerate individual chapter PDF files from NCERT chapter range string."""
    chapters: List[Dict[str, str]] = []
    if not chapters_str:
        return chapters

    m = re.match(r"^(\d+)-(\d+)$", chapters_str.strip())
    if not m:
        return chapters

    start_num = int(m.group(1))
    end_num = int(m.group(2))

    if start_num == 0:
        ps_file = f"{code}ps.pdf"
        chapters.append({
            "title": "Prelims",
            "file": ps_file,
            "path": f"{class_text}/{subject}/{title}/{ps_file}",
            "url": f"{BASE_CDN_URL}{ps_file}",
        })
        start_num = 1

    for ch_num in range(start_num, end_num + 1):
        filename = f"{code}{ch_num:02d}.pdf"
        chapters.append({
            "title": f"Chapter {ch_num}",
            "file": filename,
            "path": f"{class_text}/{subject}/{title}/{filename}",
            "url": f"{BASE_CDN_URL}{filename}",
        })

    return chapters


def make_book_entry(
    code: str,
    title: str,
    class_text: str,
    subject: str,
    chapters_str: str = "",
    url: str = "",
) -> Dict[str, Any]:
    """Create standardized book entry with ZIP archive path and chapter PDF entries."""
    clean_code = code.strip()
    clean_title = title.strip()
    clean_subj = subject.strip()
    clean_class = class_text.strip()

    book_path_arrow = f"{clean_class} --> {clean_subj} --> {clean_title}"
    zip_filename = f"{clean_code}dd.zip"
    zip_url = f"{BASE_CDN_URL}{zip_filename}"
    storage_zip_path = f"{clean_class}/{clean_subj}/{clean_title}.zip"
    book_url = url or (f"https://ncert.nic.in/textbook.php?{clean_code}={chapters_str}" if chapters_str else f"https://ncert.nic.in/textbook.php?{clean_code}")

    chapter_pdfs = build_chapter_list(clean_code, chapters_str, clean_class, clean_subj, clean_title)

    return {
        "code": clean_code,
        "title": clean_title,
        "class": clean_class,
        "subject": clean_subj,
        "book_path": book_path_arrow,
        "path": storage_zip_path,
        "zip_file": zip_filename,
        "zip_url": zip_url,
        "url": book_url,
        "chapters": chapter_pdfs,
    }


def normalize_catalog(raw_data: Any) -> Dict[str, Any]:
    """Normalize catalog JSON into standardized container keyed by official Class text."""
    class_dict: Dict[str, Dict[str, List[Dict[str, Any]]]] = {}
    by_code: Dict[str, Dict[str, Any]] = {}

    # Format 1: List of class objects [{"class": "Class I", "subjects": [...]}]
    if isinstance(raw_data, list):
        for item in raw_data:
            cls_text = item.get("class", "").strip()
            if not cls_text:
                continue
            class_dict.setdefault(cls_text, {})

            for subj_obj in item.get("subjects", []):
                subj_name = (subj_obj.get("subject") or subj_obj.get("name") or "").strip()
                if not subj_name:
                    continue

                class_dict[cls_text].setdefault(subj_name, [])
                for b in subj_obj.get("books", []):
                    code = (b.get("book_code") or b.get("code") or "").strip()
                    title = (b.get("book_title") or b.get("title") or b.get("text") or "").strip()
                    if not code or not title:
                        continue

                    # If chapters already parsed as list, keep them
                    existing_ch = b.get("chapters")
                    if isinstance(existing_ch, list):
                        ch_str = ""
                    else:
                        ch_str = str(existing_ch or "")

                    book = make_book_entry(
                        code=code,
                        title=title,
                        class_text=cls_text,
                        subject=subj_name,
                        chapters_str=ch_str,
                        url=b.get("url") or b.get("book_page_url", ""),
                    )
                    if isinstance(existing_ch, list) and existing_ch:
                        book["chapters"] = existing_ch

                    class_dict[cls_text][subj_name].append(book)
                    by_code[code] = book

    # Format 2: Dict
    elif isinstance(raw_data, dict):
        if "classes" in raw_data and isinstance(raw_data["classes"], list):
            return normalize_catalog(raw_data["classes"])

        for cls_key, subjs in raw_data.items():
            if cls_key in ("classes", "by_code", "meta"):
                continue

            # Ensure text-based representation (e.g. 'Class I' instead of '1')
            cls_text = cls_key if cls_key.lower().startswith("class") else f"Class {cls_key}"
            class_dict.setdefault(cls_text, {})

            if isinstance(subjs, dict):
                for subj_name, books in subjs.items():
                    subj_name = subj_name.strip()
                    class_dict[cls_text].setdefault(subj_name, [])
                    if isinstance(books, list):
                        for b in books:
                            code = (b.get("code") or b.get("book_code") or "").strip()
                            title = (b.get("title") or b.get("book_title") or b.get("text") or "").strip()
                            if not code or not title:
                                continue

                            existing_ch = b.get("chapters")
                            ch_str = "" if isinstance(existing_ch, list) else str(existing_ch or "")

                            book = make_book_entry(
                                code=code,
                                title=title,
                                class_text=cls_text,
                                subject=subj_name,
                                chapters_str=ch_str,
                                url=b.get("url") or b.get("book_page_url", ""),
                            )
                            if isinstance(existing_ch, list) and existing_ch:
                                book["chapters"] = existing_ch

                            class_dict[cls_text][subj_name].append(book)
                            by_code[code] = book

    # Construct unified container
    result: Dict[str, Any] = dict(class_dict)
    result["by_code"] = by_code
    classes_list = []
    for cls_name, subjs in class_dict.items():
        subj_list = []
        for s_name, b_list in subjs.items():
            subj_list.append({"name": s_name, "books": b_list})
        classes_list.append({
            "class": cls_name,
            "subjects": subj_list,
        })
    result["classes"] = classes_list
    result["meta"] = {
        "total_classes": len(classes_list),
        "total_books": len(by_code),
    }
    return result


def fetch_live_page(url: str = NCERT_URL, timeout: int = 20) -> Tuple[str, Dict[str, str]]:
    """Download NCERT textbook page and return (script_body, class_labels_dict)."""
    session = get_requests_session()
    response = session.get(url, timeout=timeout)
    response.raise_for_status()
    page_html = response.text

    # Extract official class text labels from <select name="tclass">
    class_labels = {}
    class_select = re.search(r'<select[^>]*name=[\'"]?tclass[\'"]?[^>]*>(.*?)</select>', page_html, re.DOTALL | re.IGNORECASE)
    if class_select:
        for opt in re.finditer(r'<option[^>]*value=[\'"]?([^\'"]*)[\'"]?[^>]*>([^<]*)</option>', class_select.group(1), re.IGNORECASE):
            val = opt.group(1).strip()
            name = html.unescape(opt.group(2).strip())
            if val not in ("-1", "", "..Select Class.."):
                class_labels[normalize_class_key(val)] = name

    # Extract script block containing change1()
    blocks = re.findall(
        r"<script\b[^>]*>(.*?)</script(?:\s[^>]*)?>",
        page_html,
        re.DOTALL | re.IGNORECASE,
    )
    for block in blocks:
        if "tclass.value" in block and "tsubject" in block:
            return block, class_labels

    raise ValueError("Could not find book-data script block in NCERT textbook.php")


def fetch_live_script(url: str = NCERT_URL, timeout: int = 20) -> str:
    """Download NCERT textbook page and return the raw script containing change1()."""
    script, _ = fetch_live_page(url, timeout)
    return script


def parse_live_script(
    script: str,
    class_labels: Optional[Dict[str, str]] = None,
) -> Dict[str, Any]:
    """Parse NCERT change1() conditions into a structured catalog with ZIP and chapter PDFs."""
    labels = class_labels or {}
    change1_m = re.search(r"function\s+change1\s*\([^\)]*\)\s*\{(.*)", script, re.DOTALL)
    body = change1_m.group(1) if change1_m else script

    class_dict: Dict[str, Dict[str, List[Dict[str, Any]]]] = {}
    by_code: Dict[str, Dict[str, Any]] = {}

    conditions = re.split(r"else\s+if|\bif\s*\(", body)
    for cond in conditions:
        lines: List[str] = []
        for raw_line in cond.split("\n"):
            line = raw_line.strip()
            if not line or line.startswith("//"):
                continue
            if "//" in line:
                line = line.split("//")[0].strip()
            lines.append(line)

        cleaned_block = "\n".join(lines)
        class_m = re.search(r"tclass\.value\s*==\s*['\"]?(\d+)['\"]?", cleaned_block)
        subj_m = re.search(r"tsubject\.options\[sind\]\.text\s*==\s*['\"]([^'\"]+)['\"]", cleaned_block)

        if not class_m or not subj_m:
            continue

        cls_norm = normalize_class_key(class_m.group(1))
        # Use exact text from dropdown, e.g. 'Class I', 'Class X'
        class_text = labels.get(cls_norm, f"Class {cls_norm}")
        subj = subj_m.group(1).strip()
        if subj in ("..Select Subject..", "--Select Subject--", ""):
            continue

        texts: Dict[int, str] = {}
        vals: Dict[int, str] = {}
        for line in lines:
            tm = re.search(r"tbook\.options\[(\d+)\]\.text\s*=\s*['\"]([^'\"]+)['\"]", line)
            if tm:
                texts[int(tm.group(1))] = tm.group(2).strip()
            vm = re.search(r"tbook\.options\[(\d+)\]\.value\s*=\s*['\"]([^'\"]+)['\"]", line)
            if vm:
                vals[int(vm.group(1))] = vm.group(2).strip()

        for idx in sorted(texts.keys()):
            if idx == 0:
                continue
            title = texts[idx]
            full_code = vals.get(idx, "")
            if not title or title in ("..Select Book Title..", "--Select Book Title--"):
                continue

            code_match = re.match(r"textbook\.php\?([a-zA-Z0-9]+)=(\d+-\d+|\d+)", full_code)
            book_code = code_match.group(1) if code_match else full_code.split("=")[0].replace("textbook.php?", "").strip()
            chapters_str = code_match.group(2) if code_match else ""

            if not book_code:
                continue

            book_obj = make_book_entry(
                code=book_code,
                title=title,
                class_text=class_text,
                subject=subj,
                chapters_str=chapters_str,
            )

            class_dict.setdefault(class_text, {}).setdefault(subj, []).append(book_obj)
            by_code[book_code] = book_obj

    # Build classes list representation
    classes_list = []
    for cls_name, subjs in class_dict.items():
        subj_list = []
        for s_name, b_list in subjs.items():
            subj_list.append({"name": s_name, "books": b_list})
        classes_list.append({
            "class": cls_name,
            "subjects": subj_list,
        })

    result: Dict[str, Any] = dict(class_dict)
    result["by_code"] = by_code
    result["classes"] = classes_list
    result["meta"] = {
        "total_classes": len(classes_list),
        "total_books": len(by_code),
    }
    return result


def fetch_catalog(
    catalog_path: Optional[Path] = None,
    refresh: bool = False,
) -> Dict[str, Any]:
    """Fetch or load the textbook catalog with automatic caching and seed fallback."""
    cache = catalog_path or DEFAULT_CATALOG_FILE

    # 1. Check local catalog.json cache
    if cache.exists() and not refresh:
        try:
            with open(cache, "r", encoding="utf-8") as f:
                data = json.load(f)
                norm = normalize_catalog(data)
                if norm and norm.get("meta", {}).get("total_books", 0) > 0:
                    logger.info(f"Loaded {norm['meta']['total_classes']} classes ({norm['meta']['total_books']} books) from cache ({cache.name})")
                    return norm
        except Exception as e:
            logger.warning(f"Failed to read cache {cache}: {e}")

    # 2. Live fetch directly from NCERT (extracts official class text, subjects, ZIPs, and chapter PDFs)
    try:
        logger.info("Extracting live NCERT catalog from https://ncert.nic.in/textbook.php...")
        script, class_labels = fetch_live_page()
        live_catalog = parse_live_script(script, class_labels=class_labels)
        if live_catalog and live_catalog.get("meta", {}).get("total_books", 0) > 0:
            with open(cache, "w", encoding="utf-8") as out:
                json.dump(live_catalog, out, indent=2, ensure_ascii=False)
            logger.info(
                f"Successfully refreshed live catalog ({live_catalog['meta']['total_classes']} classes, "
                f"{live_catalog['meta']['total_books']} books with ZIP/PDF paths) -> {cache.name}"
            )
            return live_catalog
    except Exception as e:
        logger.warning(f"Live NCERT fetch failed ({e}). Falling back to seed data...")

    # 3. Try offline seed data
    if DEFAULT_SEED_FILE.exists():
        try:
            with open(DEFAULT_SEED_FILE, "r", encoding="utf-8") as f:
                seed_data = json.load(f)
                norm = normalize_catalog(seed_data)
                if norm:
                    logger.info(f"Loaded {norm['meta']['total_classes']} classes from seed catalog ({DEFAULT_SEED_FILE.name})")
                    with open(cache, "w", encoding="utf-8") as out:
                        json.dump(norm, out, indent=2, ensure_ascii=False)
                    return norm
        except Exception as e:
            logger.warning(f"Failed to read seed catalog {DEFAULT_SEED_FILE}: {e}")

    raise RuntimeError("Could not load NCERT catalog from cache, live endpoint, or seed.")


def iter_books(
    catalog: Dict[str, Any],
    class_filter: Optional[str] = None,
    subject_filter: Optional[str] = None,
) -> Iterator[Tuple[str, str, Dict[str, Any]]]:
    """Yield tuples of (class_name, subject_name, book_dict) filtered as requested."""
    for cls in catalog.keys():
        # Skip special metadata keys
        if cls in ("classes", "by_code", "meta") or not isinstance(catalog[cls], dict):
            continue

        if class_filter and class_filter.lower() != "all":
            # Match both normalized key ("1" == "1") and exact text ("Class I" == "Class I")
            if normalize_class_key(cls) != normalize_class_key(class_filter) and cls.lower() != class_filter.lower():
                continue

        subjects = catalog[cls]
        for subj, books in subjects.items():
            if subject_filter and subject_filter.lower() != "all" and subj.lower() != subject_filter.lower():
                continue

            for book in books:
                if book.get("code"):
                    yield cls, subj, book


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    data = fetch_catalog(refresh=True)
    total_books = data.get("meta", {}).get("total_books", 0)
    print(f"\n[+] Catalog generated: {data.get('meta', {}).get('total_classes')} classes, {total_books} total books.")
    print("Sample book entries:")
    for sample_code in ("aemr1", "jemh1"):
        if sample_code in data.get("by_code", {}):
            b = data["by_code"][sample_code]
            print(f"\n[{b['code']}] {b['book_path']}")
            print(f"  Class (Text): {b['class']}")
            print(f"  Path (ZIP):   {b['path']}")
            print(f"  ZIP URL:      {b['zip_url']}")
            print(f"  Chapters ({len(b['chapters'])} PDFs):")
            for ch in b["chapters"][:3]:
                print(f"    - {ch['title']}: {ch['file']} ({ch['url']})")
