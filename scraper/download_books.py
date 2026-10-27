#!/usr/bin/env python3
"""NCERT Complete-Book ZIP Downloader & Archive Verifier.

Streams, validates, and archives official complete-book ZIP files from the
NCERT CDN (https://ncert.nic.in/textbook/pdf/{code}dd.zip).

Pipeline Position:
    NCERT catalogue -> catalogue validation -> complete-book ZIP downloader -> archive verification -> manifest/report

Features:
- Efficient chunked streaming with HTTP Range resume support.
- Rigorous ZIP integrity verification (is_zipfile, testzip CRC check).
- Bounded concurrency with thread pooling and exponential backoff retries.
- Temporary files with atomic finalization (os.replace).
- Deduplication: archives mapped to multiple catalogue titles (e.g. gsikr1) are downloaded only once.
- Preserves original archives intact (no watermark removal, no archive mutation).
- Generates cryptographic SHA-256 checksums and structured download manifests.
- Safe dry-run mode and targeted selection filters (class, subject, codes, limit).
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import logging
import os
from pathlib import Path
import random
import re
import shutil
import sys
import tempfile
import time
from typing import Any, Callable, Dict, List, Optional, Set, Tuple
import urllib.error
import urllib.request
import zipfile

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from ncert_scraper import BOOK_CODE_PATTERN, atomic_write_json

logger = logging.getLogger("ncert_downloader")

BASE_CDN_URL = "https://ncert.nic.in/textbook/pdf/"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
DEFAULT_CATALOG_FILE = Path(__file__).parent / "ncert_book_codes.json"
DEFAULT_OUTPUT_DIR = Path("downloads")
DEFAULT_MANIFEST_FILE = Path("download_manifest.json")
DEFAULT_CHUNK_SIZE = 131072  # 128 KB


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


def normalize_class_key(raw_class: str) -> str:
    """Normalize class representations (e.g. 'Class X', 'Class 10', '10', 'X') -> '10'."""
    clean = raw_class.lower().replace("class", "").strip()
    return ROMAN_TO_NUM.get(clean, clean)


def get_book_zip_url(code: str, cdn_base_url: str = BASE_CDN_URL) -> str:
    """Generate the official NCERT complete-book ZIP archive URL for a given book code."""
    clean_code = code.strip().lower()
    return f"{cdn_base_url.rstrip('/')}/{clean_code}dd.zip"


def compute_sha256(file_path: Path) -> str:
    """Compute cryptographic SHA-256 digest of a file in streaming chunks."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def verify_zip_archive(file_path: Path) -> Tuple[bool, str]:
    """Verify that a file is a valid, uncorrupted ZIP archive.

    Checks:
    1. ZIP file format magic signature via zipfile.is_zipfile().
    2. Comprehensive CRC32 checksum of every member via ZipFile.testzip().
    3. Contains at least one chapter PDF member.
    """
    if not file_path.exists() or file_path.stat().st_size == 0:
        return False, "File does not exist or is empty"

    if not zipfile.is_zipfile(file_path):
        return False, "Not a valid ZIP format (magic signature mismatch)"

    try:
        with zipfile.ZipFile(file_path, "r") as zf:
            corrupted_member = zf.testzip()
            if corrupted_member is not None:
                return False, f"Corrupted CRC checksum in archive member: {corrupted_member}"

            namelist = zf.namelist()
            if not namelist:
                return False, "Archive is empty (no files found)"

            has_pdf = any(m.lower().endswith(".pdf") for m in namelist)
            if not has_pdf:
                return False, "Archive contains no PDF chapter files"

            return True, f"Verified valid ZIP with {len(namelist)} entries"
    except Exception as exc:
        return False, f"ZIP verification failed: {exc}"


def probe_archive_availability(
    code: str,
    timeout: int = 12,
    cdn_base_url: str = BASE_CDN_URL,
) -> Tuple[bool, int]:
    """Inexpensive check whether complete-book ZIP archive exists on CDN.

    Returns:
        (is_available: bool, content_length_bytes: int)
    """
    url = get_book_zip_url(code, cdn_base_url)
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Connection": "close"},
        method="HEAD",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status in (200, 206):
                length = int(resp.headers.get("Content-Length", 0))
                return True, length
            return False, 0
    except urllib.error.HTTPError as he:
        if he.code == 404:
            return False, 0
        # If HEAD method is disallowed or throttled, fall back to small Range probe
        try:
            range_req = urllib.request.Request(
                url,
                headers={"User-Agent": USER_AGENT, "Range": "bytes=0-64", "Connection": "close"},
            )
            with urllib.request.urlopen(range_req, timeout=timeout) as rresp:
                if rresp.status in (200, 206):
                    content_range = rresp.headers.get("Content-Range", "")
                    m = re.search(r"/(\d+)$", content_range)
                    total_bytes = int(m.group(1)) if m else int(rresp.headers.get("Content-Length", 0))
                    return True, total_bytes
        except Exception:
            pass
        return False, 0
    except Exception:
        return False, 0


def download_book_archive(
    code: str,
    dest_path: Path,
    max_retries: int = 4,
    backoff_factor: float = 1.5,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    timeout: int = 60,
    cdn_base_url: str = BASE_CDN_URL,
) -> Tuple[bool, Dict[str, Any]]:
    """Download single complete-book ZIP archive with HTTP Range resume and atomic replace.

    Returns:
        (success: bool, metadata_or_error: dict)
    """
    clean_code = code.strip().lower()
    url = get_book_zip_url(clean_code, cdn_base_url)
    dest_path = Path(dest_path)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    part_path = dest_path.parent / f"{dest_path.name}.part"

    # If destination already exists and is valid, return immediately
    if dest_path.exists() and dest_path.stat().st_size > 0:
        valid, msg = verify_zip_archive(dest_path)
        if valid:
            size_bytes = dest_path.stat().st_size
            sha256 = compute_sha256(dest_path)
            return True, {
                "status": "cached",
                "code": clean_code,
                "url": url,
                "path": str(dest_path),
                "size_bytes": size_bytes,
                "sha256": sha256,
                "note": "Existing verified archive",
            }

    last_error: Optional[Exception] = None

    for attempt in range(1, max_retries + 1):
        resume_bytes = part_path.stat().st_size if (part_path.exists() and part_path.stat().st_size > 0) else 0

        req_headers = {
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
            "Connection": "close",
        }
        if resume_bytes > 0:
            req_headers["Range"] = f"bytes={resume_bytes}-"

        req = urllib.request.Request(url, headers=req_headers)

        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                status = resp.status
                is_partial = (status == 206)

                if status == 200:
                    # Server does not support Range or returned full content
                    resume_bytes = 0
                    mode = "wb"
                elif is_partial:
                    mode = "ab"
                else:
                    raise IOError(f"Unexpected HTTP status {status}")

                with open(part_path, mode) as out_f:
                    while True:
                        chunk = resp.read(chunk_size)
                        if not chunk:
                            break
                        out_f.write(chunk)

            # Download finished, verify integrity
            is_valid, validation_msg = verify_zip_archive(part_path)
            if not is_valid:
                logger.warning(
                    "[%s] Integrity verification failed on attempt %d: %s. Retrying...",
                    clean_code, attempt, validation_msg
                )
                part_path.unlink(missing_ok=True)
                time.sleep(1)
                continue

            # Atomic finalization
            os.replace(part_path, dest_path)
            size_bytes = dest_path.stat().st_size
            sha256 = compute_sha256(dest_path)

            return True, {
                "status": "downloaded",
                "code": clean_code,
                "url": url,
                "path": str(dest_path),
                "size_bytes": size_bytes,
                "sha256": sha256,
                "note": validation_msg,
            }

        except urllib.error.HTTPError as he:
            last_error = he
            if he.code == 404:
                # 404 Not Found is not retryable
                part_path.unlink(missing_ok=True)
                return False, {
                    "status": "not_found",
                    "code": clean_code,
                    "url": url,
                    "error": f"HTTP 404: Book archive not published on CDN",
                }
            if he.code == 416:
                # 416 Range Not Satisfiable: partial file may be invalid/oversized, reset it
                logger.warning("[%s] HTTP 416 Range Not Satisfiable. Resetting partial file...", clean_code)
                part_path.unlink(missing_ok=True)

            if attempt == max_retries:
                break
            sleep_time = (backoff_factor ** attempt) + random.uniform(0.1, 0.5)
            logger.warning("[%s] HTTP %d (attempt %d/%d): %s. Retrying in %.2fs...", clean_code, he.code, attempt, max_retries, he, sleep_time)
            time.sleep(sleep_time)

        except Exception as exc:
            last_error = exc
            if attempt == max_retries:
                break
            sleep_time = (backoff_factor ** attempt) + random.uniform(0.1, 0.5)
            logger.warning("[%s] Network error (attempt %d/%d): %s. Retrying in %.2fs...", clean_code, attempt, max_retries, exc, sleep_time)
            time.sleep(sleep_time)

    part_path.unlink(missing_ok=True)
    return False, {
        "status": "failed",
        "code": clean_code,
        "url": url,
        "error": f"Download failed after {max_retries} attempts: {last_error}",
    }


class BookDownloader:
    """Manages batch complete-book ZIP downloads and manifest generation."""

    def __init__(
        self,
        catalog_path: Path = DEFAULT_CATALOG_FILE,
        output_dir: Path = DEFAULT_OUTPUT_DIR,
        manifest_path: Path = DEFAULT_MANIFEST_FILE,
        concurrency: int = 4,
        max_retries: int = 3,
        timeout: int = 60,
    ):
        self.catalog_path = Path(catalog_path)
        self.output_dir = Path(output_dir)
        self.manifest_path = Path(manifest_path)
        self.concurrency = max(1, min(concurrency, 16))
        self.max_retries = max_retries
        self.timeout = timeout
        self.catalog_records: List[Dict[str, Any]] = []

    def load_catalog(self) -> List[Dict[str, Any]]:
        """Load and validate catalogue records."""
        if not self.catalog_path.exists():
            raise FileNotFoundError(f"Catalogue file not found at {self.catalog_path}")

        with open(self.catalog_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        records = data.get("books", []) if isinstance(data, dict) else data
        if not isinstance(records, list):
            raise ValueError(f"Invalid catalogue format in {self.catalog_path}")

        valid_records: List[Dict[str, Any]] = []
        for r in records:
            code = r.get("book_code", "").strip().lower()
            if code and BOOK_CODE_PATTERN.match(code):
                valid_records.append(r)
            else:
                logger.warning("Skipping catalogue entry with invalid code format: %s", r)

        self.catalog_records = valid_records
        logger.info("Loaded %d valid catalogue entries from %s", len(self.catalog_records), self.catalog_path.name)
        return self.catalog_records

    def filter_records(
        self,
        class_filter: Optional[str] = None,
        subject_filter: Optional[str] = None,
        codes_filter: Optional[Set[str]] = None,
        limit: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Filter loaded catalogue records by class, subject, book codes, and limit."""
        if not self.catalog_records:
            self.load_catalog()

        filtered: List[Dict[str, Any]] = []
        for r in self.catalog_records:
            cls = r.get("class", "")
            subj = r.get("subject", "")
            code = r.get("book_code", "").strip().lower()

            if class_filter and class_filter.lower() != "all":
                cf = normalize_class_key(class_filter)
                rf = normalize_class_key(cls)
                if cf != rf and class_filter.lower() != cls.lower():
                    continue

            if subject_filter and subject_filter.lower() != "all":
                if subject_filter.lower() != subj.lower():
                    continue

            if codes_filter and code not in codes_filter:
                continue

            filtered.append(r)
            if limit and len(filtered) >= limit:
                break

        return filtered

    def group_by_unique_code(
        self,
        records: List[Dict[str, Any]],
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Group catalogue records by unique book_code.

        Ensures archives mapped to multiple catalogue titles (such as 'gsikr1' shared
        by Kriti-I Sindhi and Kriti-I Telugu) are only downloaded once while
        preserving all catalogue titles in metadata.
        """
        grouped: Dict[str, List[Dict[str, Any]]] = {}
        for r in records:
            code = r["book_code"].strip().lower()
            grouped.setdefault(code, []).append(r)
        return grouped

    def run(
        self,
        class_filter: Optional[str] = None,
        subject_filter: Optional[str] = None,
        codes_filter: Optional[Set[str]] = None,
        limit: Optional[int] = None,
        dry_run: bool = False,
        progress_callback: Optional[Callable[[Dict[str, Any]], None]] = None,
    ) -> Dict[str, Any]:
        """Execute download workflow with bounded concurrency and deduplication."""
        selected_records = self.filter_records(
            class_filter=class_filter,
            subject_filter=subject_filter,
            codes_filter=codes_filter,
            limit=limit,
        )

        grouped = self.group_by_unique_code(selected_records)
        unique_codes = sorted(list(grouped.keys()))

        logger.info(
            "Selected %d catalogue records corresponding to %d unique book archives.",
            len(selected_records), len(unique_codes)
        )

        if dry_run:
            logger.info("DRY-RUN MODE: No archives will be downloaded.")
            planned_items = []
            for code in unique_codes:
                records = grouped[code]
                url = get_book_zip_url(code)
                target_path = self.output_dir / f"{code}dd.zip"
                planned_items.append({
                    "code": code,
                    "url": url,
                    "target_path": str(target_path),
                    "titles": [r.get("book") for r in records],
                    "classes": sorted(list(set(r.get("class") for r in records))),
                    "subjects": sorted(list(set(r.get("subject") for r in records))),
                })
            return {
                "dry_run": True,
                "total_records": len(selected_records),
                "unique_codes": len(unique_codes),
                "planned_downloads": planned_items,
            }

        self.output_dir.mkdir(parents=True, exist_ok=True)

        results: Dict[str, Any] = {}
        start_time = time.time()

        def _worker(code: str) -> Tuple[str, bool, Dict[str, Any]]:
            target_path = self.output_dir / f"{code}dd.zip"
            ok, meta = download_book_archive(
                code=code,
                dest_path=target_path,
                max_retries=self.max_retries,
                timeout=self.timeout,
            )
            return code, ok, meta

        stats = {
            "total_records": len(selected_records),
            "unique_codes": len(unique_codes),
            "downloaded": 0,
            "cached": 0,
            "not_found": 0,
            "failed": 0,
        }

        manifest_entries: List[Dict[str, Any]] = []

        with concurrent.futures.ThreadPoolExecutor(max_workers=self.concurrency) as executor:
            future_to_code = {executor.submit(_worker, c): c for c in unique_codes}

            for future in concurrent.futures.as_completed(future_to_code):
                code, success, meta = future.result()
                status = meta.get("status", "unknown")

                if status == "downloaded":
                    stats["downloaded"] += 1
                elif status == "cached":
                    stats["cached"] += 1
                elif status == "not_found":
                    stats["not_found"] += 1
                else:
                    stats["failed"] += 1

                records_for_code = grouped[code]
                manifest_entry = {
                    "book_code": code,
                    "status": status,
                    "url": meta.get("url", get_book_zip_url(code)),
                    "file_path": meta.get("path"),
                    "size_bytes": meta.get("size_bytes"),
                    "sha256": meta.get("sha256"),
                    "note": meta.get("note", meta.get("error", "")),
                    "catalogue_mappings": [
                        {
                            "class": r.get("class"),
                            "subject": r.get("subject"),
                            "book": r.get("book"),
                        }
                        for r in records_for_code
                    ],
                }
                manifest_entries.append(manifest_entry)

                if progress_callback:
                    progress_callback(manifest_entry)

        elapsed = time.time() - start_time

        manifest_data = {
            "meta": {
                "version": "1.0.0",
                "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "elapsed_seconds": round(elapsed, 2),
                "stats": stats,
            },
            "entries": sorted(manifest_entries, key=lambda x: x["book_code"]),
        }

        atomic_write_json(self.manifest_path, manifest_data)
        logger.info("Saved download manifest to %s (elapsed: %.2fs)", self.manifest_path, elapsed)

        return {
            "dry_run": False,
            "stats": stats,
            "elapsed_seconds": round(elapsed, 2),
            "manifest_file": str(self.manifest_path),
        }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="NCERT Complete-Book ZIP Downloader & Archive Verifier"
    )
    parser.add_argument(
        "--catalog",
        default=str(DEFAULT_CATALOG_FILE),
        help=f"Path to verified catalogue JSON (default: {DEFAULT_CATALOG_FILE.name})",
    )
    parser.add_argument(
        "--out",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Destination directory for downloaded archives",
    )
    parser.add_argument(
        "--manifest",
        default=str(DEFAULT_MANIFEST_FILE),
        help="Destination path for download manifest JSON",
    )
    parser.add_argument(
        "--concurrency",
        "-c",
        type=int,
        default=4,
        help="Maximum concurrent worker threads (default: 4)",
    )
    parser.add_argument(
        "--class",
        dest="target_class",
        default=None,
        help="Filter by class (e.g. 10 or 'Class X' or 'all')",
    )
    parser.add_argument(
        "--subject",
        default=None,
        help="Filter by subject (e.g. Mathematics, Science)",
    )
    parser.add_argument(
        "--books",
        default=None,
        help="Comma-separated book codes or path to file containing codes",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of books to download (useful for safe testing)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect matching catalogue records and plan downloads without network fetching",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose debug logging",
    )

    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="[%(asctime)s] [%(levelname)s] %(message)s",
        datefmt="%H:%M:%S",
    )

    codes_filter: Optional[Set[str]] = None
    if args.books:
        p = Path(args.books)
        if p.exists():
            codes_filter = {c.strip().lower() for c in p.read_text(encoding="utf-8").replace(",", "\n").splitlines() if c.strip()}
        else:
            codes_filter = {c.strip().lower() for c in args.books.split(",") if c.strip()}

    downloader = BookDownloader(
        catalog_path=Path(args.catalog),
        output_dir=Path(args.out),
        manifest_path=Path(args.manifest),
        concurrency=args.concurrency,
    )

    try:
        summary = downloader.run(
            class_filter=args.target_class,
            subject_filter=args.subject,
            codes_filter=codes_filter,
            limit=args.limit,
            dry_run=args.dry_run,
        )

        if args.dry_run:
            print("\n" + "=" * 60)
            print("DRY-RUN SUMMARY")
            print("=" * 60)
            print(f"Total Catalogue Records: {summary['total_records']}")
            print(f"Unique Book Archives:    {summary['unique_codes']}")
            print("\nSample planned items:")
            for item in summary["planned_downloads"][:5]:
                print(f"  - [{item['code']}] {item['url']} -> {item['target_path']}")
                print(f"    Titles: {', '.join(item['titles'])}")
            print("=" * 60)
        else:
            stats = summary["stats"]
            print("\n" + "=" * 60)
            print("DOWNLOAD SUMMARY")
            print("=" * 60)
            print(f"Total Target Records:   {stats['total_records']}")
            print(f"Unique Book Archives:   {stats['unique_codes']}")
            print(f"Downloaded & Verified:  {stats['downloaded']}")
            print(f"Already Cached/Valid:   {stats['cached']}")
            print(f"Not Published on CDN:   {stats['not_found']}")
            print(f"Download Failures:      {stats['failed']}")
            print(f"Elapsed Time:           {summary['elapsed_seconds']}s")
            print(f"Manifest Written:       {summary['manifest_file']}")
            print("=" * 60)

        return 0
    except Exception as exc:
        logger.error("Download execution failed: %s", exc, exc_info=args.verbose)
        return 1


if __name__ == "__main__":
    sys.exit(main())
