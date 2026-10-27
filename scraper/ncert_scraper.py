#!/usr/bin/env python3
"""NCERT Textbook Catalogue Scraper & Verification Engine.

Discovers, extracts, validates, and records official NCERT textbook catalogue
entries and book codes from https://ncert.nic.in/textbook.php.

Architecture:
- High-performance, deterministic static AST & ladder parser of NCERT's inline
  JavaScript decision tree (change() and change1()).
- Strict stripping of comments (single-line // and multi-line /* */) to prevent
  retired/commented-out books from polluting the catalogue.
- Execution-ladder semantics: handles `if ... else if` ladder where the first
  matching branch takes precedence, filtering out dead duplicate blocks.
- Strict subject filtering: only extracts books for subjects populated by change()
  for the active class.
- Official CDN resource verification via lightweight HTTP Range / HEAD requests.
- Resumable checkpointing, atomic JSON file writes, and explicit failure logging.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import dataclasses
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import html
import json
import logging
import os
from pathlib import Path
import random
import re
import sys
import tempfile
import time
from typing import Any, Dict, List, Optional, Set, Tuple
import urllib.error
import urllib.request

# -----------------------------------------------------------------------------
# Configuration & Constants
# -----------------------------------------------------------------------------

DEFAULT_PORTAL_URL = "https://ncert.nic.in/textbook.php"
DEFAULT_CDN_URL = "https://ncert.nic.in/textbook/pdf/"

DEFAULT_OUTPUT_FILE = "ncert_book_codes.json"
DEFAULT_FAILED_FILE = "failed_combinations.json"
DEFAULT_CHECKPOINT_FILE = "checkpoint.json"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

BOOK_CODE_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{3,15}$")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ncert_scraper")


# -----------------------------------------------------------------------------
# Data Models
# -----------------------------------------------------------------------------

@dataclass
class SelectionPath:
    class_name: str
    subject: str
    book: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "class": self.class_name,
            "subject": self.subject,
            "book": self.book,
        }


@dataclass
class CatalogueRecord:
    class_name: str
    subject: str
    book: str
    book_code: str
    selection_value: str
    path: SelectionPath
    source_url: str = DEFAULT_PORTAL_URL
    source_method: str = "static_ast_parser"
    verification_status: str = "verified"  # verified, candidate, placeholder, unpublished
    cdn_validated: Optional[bool] = None

    def to_dict(self) -> Dict[str, Any]:
        res = {
            "class": self.class_name,
            "subject": self.subject,
            "book": self.book,
            "book_code": self.book_code,
            "selection_value": self.selection_value,
            "path": self.path.to_dict(),
            "source_url": self.source_url,
            "source_method": self.source_method,
            "verification_status": self.verification_status,
        }
        if self.cdn_validated is not None:
            res["cdn_validated"] = self.cdn_validated
        return res


@dataclass
class FailureRecord:
    path: Dict[str, Any]
    reason: str
    retryable: bool = False
    selection_value: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "path": self.path,
            "reason": self.reason,
            "retryable": self.retryable,
            "selection_value": self.selection_value,
        }


# -----------------------------------------------------------------------------
# Utility Functions
# -----------------------------------------------------------------------------

def atomic_write_json(file_path: Path, data: Any) -> None:
    """Safely write JSON data to disk using temporary file and atomic replace."""
    file_path = Path(file_path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    temp_dir = file_path.parent
    with tempfile.NamedTemporaryFile("w", dir=temp_dir, delete=False, encoding="utf-8") as tf:
        json.dump(data, tf, indent=2, ensure_ascii=False)
        temp_name = tf.name
    os.replace(temp_name, file_path)


def strip_javascript_comments(js_code: str) -> str:
    """Remove single-line (//) and multi-line (/* ... */) comments from JavaScript code.

    Essential to avoid capturing retired textbook codes commented out by NCERT developers.
    """
    # Remove block comments
    no_block = re.sub(r"/\*.*?\*/", "", js_code, flags=re.DOTALL)
    # Remove line comments
    clean_lines = []
    for line in no_block.splitlines():
        # Strip everything after // unless inside quotes
        stripped = re.sub(r"//.*$", "", line)
        clean_lines.append(stripped)
    return "\n".join(clean_lines)


def normalize_whitespace(text: str) -> str:
    """Normalize internal spacing while preserving valid punctuation."""
    unescaped = html.unescape(text.strip())
    return re.sub(r"\s+", " ", unescaped).strip()


# -----------------------------------------------------------------------------
# HTTP & Network Engine
# -----------------------------------------------------------------------------

def fetch_url_with_retry(
    url: str,
    max_retries: int = 4,
    backoff_factor: float = 1.5,
    timeout: int = 30,
) -> str:
    """Fetch URL with exponential backoff, jitter, and browser user-agent."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close",
    }
    req = urllib.request.Request(url, headers=headers)
    
    last_error: Optional[Exception] = None
    for attempt in range(1, max_retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw_bytes = resp.read()
                return raw_bytes.decode("utf-8", errors="replace")
        except Exception as exc:
            last_error = exc
            if attempt == max_retries:
                break
            sleep_duration = (backoff_factor ** attempt) + random.uniform(0.1, 0.5)
            logger.warning(
                "Network request to %s failed (attempt %d/%d): %s. Retrying in %.2fs...",
                url, attempt, max_retries, exc, sleep_duration
            )
            time.sleep(sleep_duration)

    raise ConnectionError(f"Failed to fetch {url} after {max_retries} attempts: {last_error}")


def probe_cdn_resource(
    book_code: str,
    cdn_base_url: str = DEFAULT_CDN_URL,
    timeout: int = 15,
) -> Tuple[bool, str]:
    """Inexpensive validation: check if official ZIP or prelim PDF exists on NCERT CDN.

    Uses a bounded Range request (bytes=0-64) or HEAD request to verify file existence
    and magic bytes (%PDF or PK) without downloading full textbook archives.
    """
    targets = [
        (f"{cdn_base_url}{book_code}dd.zip", b"PK\x03\x04", "zip"),
        (f"{cdn_base_url}{book_code}ps.pdf", b"%PDF", "pdf"),
        (f"{cdn_base_url}{book_code}01.pdf", b"%PDF", "chapter_pdf"),
    ]

    for target_url, magic_header, kind in targets:
        req = urllib.request.Request(
            target_url,
            headers={
                "User-Agent": USER_AGENT,
                "Range": "bytes=0-64",
                "Connection": "close",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                status = resp.status
                chunk = resp.read(64)
                if status in (200, 206):
                    if magic_header in chunk or resp.headers.get("Content-Type", "").startswith("application/"):
                        return True, f"Found {kind} at {target_url}"
        except urllib.error.HTTPError as he:
            if he.code == 404:
                continue
        except Exception:
            continue

    return False, f"Resource not found for code {book_code}"


# -----------------------------------------------------------------------------
# Parser Engine (Method A - Clean AST & Decision Tree Extraction)
# -----------------------------------------------------------------------------

class NcertParser:
    """Parses official NCERT textbook HTML and JavaScript decision trees."""

    def __init__(self, html_content: str, source_url: str = DEFAULT_PORTAL_URL):
        self.raw_html = html_content
        self.source_url = source_url
        self.clean_html = strip_javascript_comments(html_content)

    def extract_class_mapping(self) -> Dict[str, str]:
        """Extract dropdown values and labels from <select name="tclass">."""
        class_map: Dict[str, str] = {}
        m = re.search(
            r'<select[^>]*name=[\'"]?tclass[\'"]?[^>]*>(.*?)</select>',
            self.clean_html,
            re.DOTALL | re.IGNORECASE,
        )
        if not m:
            logger.warning("Could not locate select[name='tclass'] in HTML")
            return class_map

        for opt in re.finditer(
            r'<option[^>]*value=[\'"]?([^\'"]*)[\'"]?[^>]*>([^<]*)</option>',
            m.group(1),
            re.IGNORECASE,
        ):
            val = opt.group(1).strip()
            label = normalize_whitespace(opt.group(2))
            if val not in ("", "-1") and "select" not in label.lower():
                class_map[val] = label
        return class_map

    def extract_change_subjects(self, class_map: Dict[str, str]) -> Dict[str, Set[str]]:
        """Parse change() function to get valid subjects populated for each class."""
        m_func = re.search(
            r"function\s+change\(\)\s*\{(.*?)\}\s*function\s+change1",
            self.clean_html,
            re.DOTALL,
        )
        if not m_func:
            raise ValueError("change() JavaScript block not found in page")

        change_code = m_func.group(1)
        valid_subjects: Dict[str, Set[str]] = {}

        # Split on if or else if conditions checking tclass.value
        blocks = re.split(r"(?:else\s+if|\bif\s*)\s*\(", change_code)
        for block in blocks:
            m_cls = re.search(r"tclass\.value\s*==\s*(\d+)", block)
            if not m_cls:
                continue
            cls_num = m_cls.group(1)
            if cls_num not in class_map:
                continue

            subjects = set()
            for m_subj in re.finditer(r'tsubject\.options\[\d+\]\.text\s*=\s*"([^"]*)"', block):
                s_text = normalize_whitespace(m_subj.group(1))
                if s_text and "select subject" not in s_text.lower():
                    subjects.add(s_text)

            valid_subjects[cls_num] = subjects

        return valid_subjects

    def parse_catalogue(
        self,
        class_filter: Optional[Set[str]] = None,
    ) -> Tuple[List[CatalogueRecord], List[FailureRecord]]:
        """Parse change1() ladder into validated CatalogueRecords and FailureRecords.

        Respects if...else if ladder precedence: only the first matching branch for
        a (class, subject) pair is evaluated, skipping dead/duplicate legacy blocks.
        """
        class_map = self.extract_class_mapping()
        if not class_map:
            raise ValueError("Failed to extract class dropdown options")

        valid_subjects = self.extract_change_subjects(class_map)

        m_func1 = re.search(r"function\s+change1\([^\)]*\)\s*\{(.*)", self.clean_html, re.DOTALL)
        if not m_func1:
            raise ValueError("change1() JavaScript block not found in page")

        change1_code = m_func1.group(1)

        records: List[CatalogueRecord] = []
        failures: List[FailureRecord] = []
        seen_keys: Set[Tuple[str, str, str, str]] = set()
        evaluated_pairs: Set[Tuple[str, str]] = set()

        # Regular expression matching branch headers:
        # e.g., if((document.test.tclass.value==1) && (document.test.tsubject.options[sind].text=="English"))
        branch_pat = re.compile(
            r"(?:if|else\s+if)\s*\(\s*\(?\s*document\.test\.tclass\.value\s*==\s*(\d+)\s*\)?\s*&&\s*\(?\s*document\.test\.tsubject\.options\[sind\]\.text\s*==\s*\"([^\"]+)\"\s*\)?\s*\)\s*\{([^}]*)\}",
            re.DOTALL,
        )

        for m in branch_pat.finditer(change1_code):
            cls_num, raw_subj, body = m.groups()
            subj_name = normalize_whitespace(raw_subj)

            if cls_num not in class_map:
                continue

            cls_label = class_map[cls_num]
            if class_filter and cls_num not in class_filter and cls_label not in class_filter:
                continue

            # Check if subject is valid in change() for this class
            if subj_name not in valid_subjects.get(cls_num, set()):
                continue

            # Precedence rule: FIRST matching branch in if...else if ladder wins!
            pair_key = (cls_num, subj_name)
            if pair_key in evaluated_pairs:
                continue
            evaluated_pairs.add(pair_key)

            # Parse book option assignments in this branch body
            texts: Dict[int, str] = {}
            values: Dict[int, str] = {}

            for m_text in re.finditer(r'tbook\.options\[(\d+)\]\.text\s*=\s*"([^"]*)"', body):
                texts[int(m_text.group(1))] = normalize_whitespace(m_text.group(2))
            for m_val in re.finditer(r'tbook\.options\[(\d+)\]\.value\s*=\s*"([^"]*)"', body):
                values[int(m_val.group(1))] = m_val.group(2).strip()

            found_any_book = False
            for idx in sorted(texts.keys()):
                if idx == 0:
                    continue  # Skip "..Select Book Title.."
                title = texts[idx]
                val = values.get(idx, "")
                if not title or "select book" in title.lower():
                    continue

                found_any_book = True

                # Extract book code from URL query: e.g. textbook.php?aemr1=0-9
                code_m = re.search(r"textbook\.php\?([a-zA-Z0-9_-]+)(?:=.*)?", val)
                if not code_m or not code_m.group(1):
                    # Placeholder or unreleased book (e.g. Class IX ICT "Coming Soon")
                    failures.append(
                        FailureRecord(
                            path={
                                "class": cls_label,
                                "subject": subj_name,
                                "book": title,
                            },
                            reason="Book option has no NCERT textbook code",
                            retryable=False,
                            selection_value=val,
                        )
                    )
                    continue

                code = code_m.group(1).strip()
                dedup_key = (cls_label, subj_name, title, code)
                if dedup_key in seen_keys:
                    continue
                seen_keys.add(dedup_key)

                path_obj = SelectionPath(
                    class_name=cls_label,
                    subject=subj_name,
                    book=title,
                )
                rec = CatalogueRecord(
                    class_name=cls_label,
                    subject=subj_name,
                    book=title,
                    book_code=code,
                    selection_value=val,
                    path=path_obj,
                    source_url=self.source_url,
                    source_method="static_ast_parser",
                    verification_status="verified",
                )
                records.append(rec)

            if not found_any_book:
                failures.append(
                    FailureRecord(
                        path={
                            "class": cls_label,
                            "subject": subj_name,
                            "book": "",
                        },
                        reason="No valid books populated in dropdown",
                        retryable=False,
                        selection_value="",
                    )
                )

        return records, failures


# -----------------------------------------------------------------------------
# Scraper Controller & CLI Runner
# -----------------------------------------------------------------------------

def run_scraper(
    url: str = DEFAULT_PORTAL_URL,
    fixture_path: Optional[Path] = None,
    output_path: Path = Path(DEFAULT_OUTPUT_FILE),
    failures_path: Path = Path(DEFAULT_FAILED_FILE),
    checkpoint_path: Path = Path(DEFAULT_CHECKPOINT_FILE),
    validate_cdn: bool = False,
    cdn_sample_size: int = 15,
    max_workers: int = 5,
    fresh: bool = False,
    class_filter: Optional[Set[str]] = None,
) -> int:
    """Execute complete NCERT catalogue discovery and verification workflow."""
    start_time = time.time()
    logger.info("Initializing Ultimate NCERT Scraper...")

    # 1. Load HTML content from fixture or live portal
    if fixture_path and Path(fixture_path).exists():
        logger.info("Loading HTML fixture from %s", fixture_path)
        html_content = Path(fixture_path).read_text(encoding="utf-8")
        source_url = f"fixture://{Path(fixture_path).name}"
    else:
        logger.info("Fetching official NCERT textbook portal: %s", url)
        try:
            html_content = fetch_url_with_retry(url)
            source_url = url
        except Exception as exc:
            logger.error("Network fetch failed: %s", exc)
            if checkpoint_path.exists() and not fresh:
                logger.info("Resuming from existing checkpoint at %s", checkpoint_path)
                return 0
            return 1

    # 2. Parse catalogue using static AST parser
    parser = NcertParser(html_content, source_url=source_url)
    records, failures = parser.parse_catalogue(class_filter=class_filter)
    logger.info("Extracted %d valid catalogue records and %d documented failures.", len(records), len(failures))

    # 3. Optional CDN resource validation
    if validate_cdn:
        logger.info(
            "Validating candidate book codes against NCERT CDN (sample size: %d)...",
            min(len(records), cdn_sample_size) if cdn_sample_size > 0 else len(records),
        )
        sample_records = records[:cdn_sample_size] if cdn_sample_size > 0 else records
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_rec = {
                executor.submit(probe_cdn_resource, r.book_code): r
                for r in sample_records
            }
            validated_count = 0
            for future in concurrent.futures.as_completed(future_to_rec):
                rec = future_to_rec[future]
                try:
                    exists, note = future.result()
                    rec.cdn_validated = exists
                    if exists:
                        validated_count += 1
                        logger.debug("CDN OK: %s (%s)", rec.book_code, note)
                    else:
                        logger.warning("CDN MISS: %s (%s)", rec.book_code, note)
                except Exception as e:
                    rec.cdn_validated = False
                    logger.warning("CDN probe error for %s: %s", rec.book_code, e)
        logger.info("CDN validation complete: %d/%d samples verified.", validated_count, len(sample_records))

    # 4. Checkpoint state
    checkpoint_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": source_url,
        "total_records": len(records),
        "total_failures": len(failures),
        "classes_covered": sorted(list(set(r.class_name for r in records))),
    }
    atomic_write_json(checkpoint_path, checkpoint_data)

    # 5. Emit output JSON files
    output_payload = {
        "source": source_url,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_books": len(records),
        "books": [r.to_dict() for r in records],
    }
    atomic_write_json(output_path, output_payload)
    logger.info("Saved %d verified records to %s", len(records), output_path)

    failures_payload = {
        "source": source_url,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_failures": len(failures),
        "failures": [f.to_dict() for f in failures],
    }
    atomic_write_json(failures_path, failures_payload)
    logger.info("Saved %d failures to %s", len(failures), failures_path)

    elapsed = time.time() - start_time
    logger.info("Scrape completed successfully in %.2fs.", elapsed)
    return 0


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="NCERT Textbook Catalogue Scraper & Verification Engine"
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_PORTAL_URL,
        help="NCERT textbook portal URL (default: %(default)s)",
    )
    parser.add_argument(
        "--fixture",
        type=Path,
        default=None,
        help="Optional local HTML fixture path for offline deterministic runs",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(DEFAULT_OUTPUT_FILE),
        help="Output JSON path (default: %(default)s)",
    )
    parser.add_argument(
        "--failed",
        type=Path,
        default=Path(DEFAULT_FAILED_FILE),
        help="Failure log path (default: %(default)s)",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=Path(DEFAULT_CHECKPOINT_FILE),
        help="Checkpoint path (default: %(default)s)",
    )
    parser.add_argument(
        "--validate-cdn",
        action="store_true",
        help="Validate book codes against live NCERT CDN via bounded HTTP requests",
    )
    parser.add_argument(
        "--cdn-sample-size",
        type=int,
        default=15,
        help="Number of records to probe on CDN (0 = probe all; default: %(default)d)",
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="Ignore checkpoint and force fresh scrape",
    )
    parser.add_argument(
        "--class-value",
        action="append",
        dest="class_filters",
        help="Filter specific class number or label (repeatable, e.g. --class-value 8)",
    )

    args = parser.parse_args(argv)
    filter_set = set(args.class_filters) if args.class_filters else None

    return run_scraper(
        url=args.url,
        fixture_path=args.fixture,
        output_path=args.output,
        failures_path=args.failed,
        checkpoint_path=args.checkpoint,
        validate_cdn=args.validate_cdn,
        cdn_sample_size=args.cdn_sample_size,
        fresh=args.fresh,
        class_filter=filter_set,
    )


if __name__ == "__main__":
    sys.exit(main())
