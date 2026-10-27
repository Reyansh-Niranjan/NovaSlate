#!/usr/bin/env python3
"""NCERT Textbook Downloader and PDF Assembler.

Downloads official complete-book ZIP archives from NCERT's CDN, extracts all chapter PDFs,
and merges them into a clean, unified textbook PDF with proper page ordering.
Watermark removal is disabled in compliance with project governance and publisher notice integrity.
Original downloaded archives are strictly preserved.
"""

from __future__ import annotations

import logging
import os
import re
import shutil
import time
import zipfile
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests

try:
    import pymupdf as fitz
except ImportError:
    fitz = None

from download_books import (
    BASE_CDN_URL,
    USER_AGENT,
    compute_sha256,
    download_book_archive,
    get_book_zip_url,
    probe_archive_availability,
    verify_zip_archive,
)

logger = logging.getLogger("ncert_scraper.downloader")


def probe_book(code: str, timeout: int = 12) -> Tuple[bool, int]:
    """Check if book archive is published on NCERT CDN."""
    return probe_archive_availability(code, timeout=timeout)


def sanitize_filename(name: str) -> str:
    """Sanitize string for safe cross-platform file paths and eliminate traversal."""
    # Remove directory separators and reserved characters
    clean = re.sub(r'[\\/*?:"<>|]', "", name)
    # Remove traversal dot sequences (e.g. .., ..., leading dots)
    clean = re.sub(r"^\.+", "", clean)
    clean = re.sub(r"\.\.+", "", clean)
    sanitized = "".join(c for c in clean if c.isalnum() or c in (" ", "-", "_", "(", ")", "."))
    return sanitized.strip(" .") or "Untitled"


def download_zip(
    code: str,
    dest_path: Path,
    max_retries: int = 3,
    chunk_size: int = 131072,
) -> bool:
    """Download book ZIP archive with resume and retry capability."""
    ok, _ = download_book_archive(
        code=code,
        dest_path=dest_path,
        max_retries=max_retries,
        chunk_size=chunk_size,
    )
    return ok


def sort_chapter_pdfs(pdf_paths: List[Path]) -> List[Path]:
    """Sort extracted chapter PDFs in logical reading order:
    1. Prelims / cover / preface (*ps.pdf, *cc.pdf, *pr.pdf)
    2. Chapters (*01.pdf, *02.pdf, ..., *15.pdf)
    3. Answers / Glossary / Appendices (*an.pdf, *a1.pdf)
    """
    prelims: List[Path] = []
    chapters: List[Path] = []
    postlims: List[Path] = []

    for path in pdf_paths:
        stem = path.stem.lower()
        if any(stem.endswith(s) for s in ("ps", "cc", "pr", "cover", "prelim")):
            prelims.append(path)
        elif any(stem.endswith(s) for s in ("an", "a1", "a2", "ans", "glossary", "app")):
            postlims.append(path)
        else:
            chapters.append(path)

    prelims.sort(key=lambda p: p.name.lower())
    chapters.sort(key=lambda p: p.name.lower())
    postlims.sort(key=lambda p: p.name.lower())

    return prelims + chapters + postlims


def merge_zip_to_pdf(
    zip_path: Path,
    out_pdf_path: Path,
    keep_zip: bool = True,
    optimize: bool = False,
    target_dpi: int = 140,
    jpeg_quality: int = 75,
) -> Optional[Path]:
    """Extract chapter PDFs from ZIP archive and merge them into a single PDF.

    Preserves original archives intact and maintains publication notice integrity.
    """
    if fitz is None:
        raise ImportError("PyMuPDF (fitz) is required for PDF assembly")

    zip_path = Path(zip_path)
    if not zip_path.exists():
        return None

    out_pdf_path = Path(out_pdf_path)
    out_pdf_path.parent.mkdir(parents=True, exist_ok=True)
    tmp_extract_dir = zip_path.parent / f"_tmp_{zip_path.stem}"

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            for member in zf.namelist():
                if member.lower().endswith(".pdf"):
                    try:
                        zf.extract(member, tmp_extract_dir)
                    except Exception as err:
                        logger.warning(f"Skipping damaged entry {member} in {zip_path.name}: {err}")

        pdf_files = list(tmp_extract_dir.rglob("*.pdf"))
        if not pdf_files:
            logger.warning(f"No PDF files found inside {zip_path}")
            return None

        sorted_pdfs = sort_chapter_pdfs(pdf_files)

        doc = fitz.open()
        for pdf_file in sorted_pdfs:
            try:
                doc.insert_file(str(pdf_file))
            except Exception as e:
                logger.warning(f"Skipping corrupted chapter PDF {pdf_file.name}: {e}")

        if doc.page_count == 0:
            doc.close()
            logger.error(f"Merged PDF has 0 pages for {zip_path.name}")
            return None

        doc.save(str(out_pdf_path), garbage=4, deflate=True)
        doc.close()

        if not keep_zip:
            logger.info("Retaining source ZIP archive to preserve original download.")

        # Optional compression pass (without modifying original archive)
        if optimize:
            try:
                from optimizer import optimize_pdf
                optimize_pdf(out_pdf_path, out_pdf_path, target_dpi=target_dpi, jpeg_quality=jpeg_quality)
            except Exception as opt_err:
                logger.warning(f"Optimization failed on {out_pdf_path.name}: {opt_err}")

        return out_pdf_path

    except Exception as e:
        logger.error(f"Failed to merge {zip_path.name}: {e}")
        return None
    finally:
        shutil.rmtree(tmp_extract_dir, ignore_errors=True)
