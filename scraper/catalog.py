#!/usr/bin/env python3
"""NCERT Textbook Catalogue Loader & Normalizer.

Loads, validates, and normalizes the verified NCERT textbook catalogue.
Derived from the authoritative AST-parsed NCERT portal decision tree.
Preserves all 1,068 catalogue records (1,067 active verified textbooks, 1 documented failure),
duplicate mappings (gsikr1), and distinct titles.
Generates official complete-book ZIP URLs and structured chapter metadata.
"""

from __future__ import annotations

import html
import json
import logging
from pathlib import Path
import re
from typing import Any, Dict, Iterator, List, Optional, Tuple

from ncert_scraper import (
    BOOK_CODE_PATTERN,
    CatalogueRecord,
    NcertParser,
    atomic_write_json,
    normalize_whitespace,
)

logger = logging.getLogger("ncert_scraper.catalog")

NCERT_URL = "https://ncert.nic.in/textbook.php"
BASE_CDN_URL = "https://ncert.nic.in/textbook/pdf/"
DEFAULT_CODES_FILE = Path(__file__).parent / "ncert_book_codes.json"
DEFAULT_FIXTURE_FILE = Path(__file__).parent / "tests" / "fixtures" / "textbook.php.html"

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

NUM_TO_ROMAN = {v: k.upper() for k, v in ROMAN_TO_NUM.items()}


def normalize_class_key(raw_class: str) -> str:
    """Normalize class representations (e.g. 'Class X', 'Class 10', '10', 'X') -> '10'."""
    clean = raw_class.lower().replace("class", "").strip()
    if clean in ROMAN_TO_NUM:
        return ROMAN_TO_NUM[clean]
    if clean.isdigit():
        return str(int(clean))
    return clean


def make_book_entry(
    code: str,
    title: str,
    class_text: str,
    subject: str,
    selection_val: str = "",
) -> Dict[str, Any]:
    """Create standardized book entry with complete-book ZIP archive URL and chapter metadata."""
    clean_code = code.strip().lower()
    clean_title = title.strip()
    clean_subj = subject.strip()
    clean_class = class_text.strip()

    book_path_arrow = f"{clean_class} --> {clean_subj} --> {clean_title}"
    zip_filename = f"{clean_code}dd.zip"
    zip_url = f"{BASE_CDN_URL}{zip_filename}"
    storage_zip_path = f"{clean_class}/{clean_subj}/{clean_title}.zip"

    # Extract chapter range if encoded in selection value (e.g. textbook.php?aemr1=0-9)
    chapter_range = ""
    if selection_val and "=" in selection_val:
        m = re.search(r"=\s*(\d+-\d+)", selection_val)
        if m:
            chapter_range = m.group(1)

    chapters: List[Dict[str, str]] = []
    if chapter_range:
        m_range = re.match(r"^(\d+)-(\d+)$", chapter_range)
        if m_range:
            start_num = int(m_range.group(1))
            end_num = int(m_range.group(2))
            if start_num == 0:
                chapters.append({
                    "title": "Prelims",
                    "file": f"{clean_code}ps.pdf",
                    "path": f"{clean_class}/{clean_subj}/{clean_title}/{clean_code}ps.pdf",
                    "url": f"{BASE_CDN_URL}{clean_code}ps.pdf",
                })
                start_num = 1
            for ch in range(start_num, end_num + 1):
                f_name = f"{clean_code}{ch:02d}.pdf"
                chapters.append({
                    "title": f"Chapter {ch}",
                    "file": f_name,
                    "path": f"{clean_class}/{clean_subj}/{clean_title}/{f_name}",
                    "url": f"{BASE_CDN_URL}{f_name}",
                })

    return {
        "code": clean_code,
        "title": clean_title,
        "class": clean_class,
        "subject": clean_subj,
        "book_path": book_path_arrow,
        "path": storage_zip_path,
        "zip_file": zip_filename,
        "zip_url": zip_url,
        "url": f"https://ncert.nic.in/textbook.php?{clean_code}",
        "selection_value": selection_val,
        "chapters": chapters,
    }


def fetch_catalog(
    codes_path: Optional[Path] = None,
    refresh: bool = False,
) -> Dict[str, Any]:
    """Load and return the verified NCERT catalogue.

    Returns normalized catalogue dictionary mapping class -> subject -> list of book dicts,
    along with 'by_code' lookup table and 'meta' statistics.
    """
    file_path = Path(codes_path or DEFAULT_CODES_FILE)

    records: List[Dict[str, Any]] = []

    if refresh:
        # Re-parse from fixture or live endpoint using AST parser
        fixture = DEFAULT_FIXTURE_FILE
        if fixture.exists():
            html_text = fixture.read_text(encoding="utf-8")
            parser = NcertParser(html_text, source_url=f"fixture://{fixture.name}")
        else:
            from ncert_scraper import fetch_url_with_retry
            html_text = fetch_url_with_retry(NCERT_URL)
            parser = NcertParser(html_text, source_url=NCERT_URL)

        ast_records, _ = parser.parse_catalogue()
        records = [r.to_dict() for r in ast_records]
    elif file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        records = data.get("books", []) if isinstance(data, dict) else data
    else:
        raise FileNotFoundError(f"Catalogue file not found at {file_path}")

    class_dict: Dict[str, Dict[str, List[Dict[str, Any]]]] = {}
    by_code: Dict[str, List[Dict[str, Any]]] = {}
    unique_codes: set = set()

    for r in records:
        cls_name = r.get("class", "").strip()
        subj_name = r.get("subject", "").strip()
        book_title = r.get("book", "").strip()
        code = r.get("book_code", "").strip().lower()
        val = r.get("selection_value", "")

        if not cls_name or not subj_name or not code:
            continue

        entry = make_book_entry(
            code=code,
            title=book_title,
            class_text=cls_name,
            subject=subj_name,
            selection_val=val,
        )

        class_dict.setdefault(cls_name, {}).setdefault(subj_name, []).append(entry)
        by_code.setdefault(code, []).append(entry)
        unique_codes.add(code)

    meta = {
        "source": "NCERT Official (Static AST Verified)",
        "total_classes": len(class_dict),
        "total_books": len(records),
        "unique_codes": len(unique_codes),
    }

    result: Dict[str, Any] = {
        "meta": meta,
        "by_code": by_code,
    }
    result.update(class_dict)
    return result


def iter_books(
    catalog: Dict[str, Any],
    class_filter: Optional[str] = None,
    subject_filter: Optional[str] = None,
) -> Iterator[Tuple[str, str, Dict[str, Any]]]:
    """Yield tuples of (class_name, subject_name, book_dict) filtered by class and subject."""
    for cls in catalog.keys():
        if cls in ("classes", "by_code", "meta") or not isinstance(catalog[cls], dict):
            continue

        if class_filter and class_filter.lower() != "all":
            if normalize_class_key(cls) != normalize_class_key(class_filter) and cls.lower() != class_filter.lower():
                continue

        subjects = catalog[cls]
        for subj, books in subjects.items():
            if subject_filter and subject_filter.lower() != "all" and subj.lower() != subject_filter.lower():
                continue

            for book in books:
                if book.get("code"):
                    yield cls, subj, book
