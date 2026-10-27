#!/usr/bin/env python3
# /// script
# dependencies = [
#   "requests>=2.31.0",
#   "pymupdf>=1.24.0",
#   "pillow>=10.0.0",
#   "rich>=13.0.0",
#   "python-dotenv>=1.0.0",
# ]
# ///
"""NCERT Textbook Scraper & Complete-Book Downloader CLI.

Orchestrates textbook catalogue discovery, validation, streaming complete-book ZIP
downloads, archive integrity verification, manifest generation, and optional PDF assembly.
Uploads assembled textbook archives/PDFs directly to Internet Archive (IAS3) and synchronizes
authoritative catalog.json to the Internet Archive item root.
Supabase catalog synchronization has been permanently retired.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from dotenv import load_dotenv
from rich.console import Console
from rich.logging import RichHandler
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    SpinnerColumn,
    TextColumn,
    TimeElapsedColumn,
    TimeRemainingColumn,
)
from rich.table import Table

# Add module to path
sys.path.insert(0, str(Path(__file__).parent))

from catalog import fetch_catalog, iter_books, normalize_class_key
from ia_uploader import IAUploader, DEFAULT_BUCKET
from download_books import BookDownloader, get_book_zip_url, verify_zip_archive
from downloader import merge_zip_to_pdf, sanitize_filename
from optimizer import format_size, optimize_pdf

# Load local environment if present
load_dotenv()
load_dotenv(Path(__file__).parent.parent / ".env.local")
load_dotenv(Path(__file__).parent.parent / ".env")

console = Console(safe_box=True)


def setup_logger(verbose: bool = False):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=console, rich_tracebacks=True, show_path=False)],
    )


def main():
    parser = argparse.ArgumentParser(
        description="NovaSlate NCERT Catalogue & Complete-Book ZIP Pipeline",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--class",
        dest="target_class",
        default="all",
        help="Target NCERT class (e.g. 10, 'Class X', or 'all')",
    )
    parser.add_argument(
        "--subject",
        default=None,
        help="Target subject (or all if omitted)",
    )
    parser.add_argument(
        "--out",
        default="downloads",
        help="Output directory for downloaded books",
    )
    parser.add_argument(
        "--manifest",
        default="download_manifest.json",
        help="Path for download manifest output JSON",
    )
    parser.add_argument(
        "--concurrency",
        "-c",
        type=int,
        default=4,
        help="Parallel worker threads",
    )
    parser.add_argument(
        "--books",
        default=None,
        help="Comma-separated book codes or file with codes to filter",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of book archives to process (safe testing)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect and list matching books without downloading",
    )
    parser.add_argument(
        "--assemble-pdf",
        action="store_true",
        help="Optionally unpack chapter PDFs from ZIP and merge into unified textbook PDF (original ZIP is preserved)",
    )
    parser.add_argument(
        "--compress",
        action="store_true",
        help="Downsample images and deflate PDF streams during optional PDF assembly",
    )
    parser.add_argument(
        "--dpi",
        type=int,
        default=140,
        help="Target DPI for image downsampling when --compress is enabled",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=75,
        help="JPEG quality (1-100) when --compress is enabled",
    )
    parser.add_argument(
        "--refresh-catalog",
        action="store_true",
        help="Re-parse catalogue from NCERT portal HTML using AST parser",
    )
    parser.add_argument(
        "--upload-to-ia",
        action="store_true",
        help="Upload verified books and sync catalog.json directly to Internet Archive (IAS3)",
    )
    parser.add_argument(
        "--sync-catalog",
        action="store_true",
        help="Generate and synchronize authoritative catalog.json to Internet Archive root without downloading",
    )
    parser.add_argument(
        "--bucket",
        default=None,
        help="Target Internet Archive item identifier (default: novaslate-ncert-library)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose debug logging",
    )

    args = parser.parse_args()
    setup_logger(args.verbose)

    uploader: Optional[IAUploader] = None
    if args.upload_to_ia or args.sync_catalog:
        uploader = IAUploader(bucket_name=args.bucket)
        if not uploader.is_ia_configured() and not args.dry_run:
            console.print(
                "[bold red][!] ERROR: Internet Archive credentials (IA_ACCESS_KEY, IA_SECRET_KEY) are missing.[/bold red]\n"
                "Please configure them in .env.local or environment variables before uploading."
            )
            return 1
        console.print(f"[green]✓ Internet Archive S3 uploader initialized for item '{uploader.bucket_name}'.[/green]")

    if args.sync_catalog:
        console.print(f"\n[bold yellow]Synchronizing verified NCERT catalog.json to Internet Archive item '{uploader.bucket_name}'...[/bold yellow]")
        if args.dry_run:
            console.print("[dim]DRY RUN: Skipping remote catalog upload.[/dim]")
            return 0
        sync_ok = uploader.upload_catalog_manifest()
        if sync_ok:
            console.print(f"[bold green]✓ Successfully synchronized catalog.json to Internet Archive item '{uploader.bucket_name}'![/bold green]")
            return 0
        else:
            console.print("[bold red]! Failed to synchronize catalog.json to Internet Archive.[/bold red]")
            return 1

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    console.print("[bold cyan]========================================================================[/bold cyan]")
    console.print("[bold cyan]  NovaSlate NCERT Catalogue Discovery & Downloader Pipeline             [/bold cyan]")
    console.print("[bold cyan]========================================================================[/bold cyan]")

    # Step 1: Catalogue Extraction / Loading
    console.print("\n[bold yellow][1/3] Loading Verified NCERT Catalogue...[/bold yellow]")
    try:
        catalog = fetch_catalog(refresh=args.refresh_catalog)
    except Exception as exc:
        console.print(f"[bold red]Failed to load catalogue: {exc}[/bold red]")
        return 1

    meta = catalog.get("meta", {})
    console.print(
        f"[green]✓ Verified Catalogue Loaded: {meta.get('total_classes')} classes, "
        f"{meta.get('total_books')} records, {meta.get('unique_codes')} unique archives.[/green]"
    )

    # Step 2: Downloader Orchestration
    console.print(f"\n[bold yellow][2/3] Orchestrating Downloader (Class: {args.target_class}, Subject: {args.subject or 'all'})...[/bold yellow]")

    codes_filter: Optional[Set[str]] = None
    if args.books:
        p = Path(args.books)
        if p.exists():
            codes_filter = {c.strip().lower() for c in p.read_text(encoding="utf-8").replace(",", "\n").splitlines() if c.strip()}
        else:
            codes_filter = {c.strip().lower() for c in args.books.split(",") if c.strip()}

    downloader = BookDownloader(
        catalog_path=Path(__file__).parent / "ncert_book_codes.json",
        output_dir=out_dir,
        manifest_path=Path(args.manifest),
        concurrency=args.concurrency,
    )

    summary = downloader.run(
        class_filter=args.target_class,
        subject_filter=args.subject,
        codes_filter=codes_filter,
        limit=args.limit,
        dry_run=args.dry_run,
    )

    if args.dry_run:
        console.print("\n[bold magenta]DRY RUN EXECUTION COMPLETE[/bold magenta]")
        table = Table(title="Planned Book Downloads", show_header=True, header_style="bold cyan")
        table.add_column("Code", style="cyan", width=10)
        table.add_column("Classes", style="dim", width=12)
        table.add_column("Titles", style="white")
        table.add_column("Official ZIP URL", style="blue")

        for item in summary["planned_downloads"][:15]:
            table.add_row(
                item["code"],
                ", ".join(item["classes"]),
                ", ".join(item["titles"]),
                item["url"],
            )

        console.print(table)
        console.print(
            f"[dim]Total records: {summary['total_records']} | Unique archives: {summary['unique_codes']}[/dim]"
        )
        return 0

    stats = summary.get("stats", {})

    # Step 3: Optional PDF Assembly & Internet Archive Upload Pass
    uploaded_count = 0
    already_on_ia_count = 0
    upload_failures = 0

    should_process_books = (args.assemble_pdf or args.upload_to_ia) and (stats.get("downloaded", 0) + stats.get("cached", 0) > 0)
    if should_process_books:
        action_desc = "PDF Assembly & IA Upload Pass" if (args.assemble_pdf and args.upload_to_ia) else ("IA Upload Pass" if args.upload_to_ia else "PDF Assembly Pass")
        console.print(f"\n[bold yellow][3/3] {action_desc} (Original ZIP archives preserved)...[/bold yellow]")

        for cls_name, subj_name, book in iter_books(catalog, class_filter=args.target_class, subject_filter=args.subject):
            code = book["code"]
            if codes_filter and code not in codes_filter:
                continue

            zip_path = out_dir / f"{code}dd.zip"
            if not zip_path.exists():
                continue

            c_num = normalize_class_key(cls_name)
            class_folder = f"Class {c_num}" if c_num.isdigit() else cls_name
            safe_cls = cls_name.replace(" ", "_")
            safe_subj = sanitize_filename(subj_name)
            safe_title = sanitize_filename(book["title"])
            pdf_path = out_dir / safe_cls / safe_subj / f"{safe_title}.pdf"

            # Assemble PDF if requested or needed for IA upload
            if (args.assemble_pdf or args.upload_to_ia) and (not pdf_path.exists() or pdf_path.stat().st_size == 0):
                console.print(f"[dim]Assembling: {book['title']} ({code})...[/dim]")
                merge_zip_to_pdf(
                    zip_path=zip_path,
                    out_pdf_path=pdf_path,
                    keep_zip=True,  # Mandatory: original archive kept unchanged
                    optimize=args.compress,
                    target_dpi=args.dpi,
                    jpeg_quality=args.quality,
                )

            # Upload to Internet Archive
            if args.upload_to_ia and uploader:
                remote_pdf_path = f"{class_folder}/{subj_name}/{book['title']}.pdf"
                if uploader.exists(remote_pdf_path):
                    already_on_ia_count += 1
                    console.print(f"[dim]Already on IA: {remote_pdf_path}[/dim]")
                else:
                    target_upload = pdf_path if (pdf_path.exists() and pdf_path.stat().st_size > 0) else zip_path
                    content_type = "application/pdf" if target_upload.suffix.lower() == ".pdf" else "application/zip"
                    remote_target_path = remote_pdf_path if target_upload.suffix.lower() == ".pdf" else f"{class_folder}/{subj_name}/{book['title']}.zip"
                    console.print(f"[*] Uploading to IA: {remote_target_path} ({target_upload.stat().st_size} bytes)...")
                    ok = uploader.upload_file(target_upload, remote_target_path, content_type=content_type)
                    if ok:
                        uploaded_count += 1
                    else:
                        upload_failures += 1

        # Synchronize catalog manifest on IA if any books were processed with --upload-to-ia
        if args.upload_to_ia and uploader:
            console.print(f"\n[bold yellow]Synchronizing updated catalog.json on Internet Archive...[/bold yellow]")
            sync_ok = uploader.upload_catalog_manifest(catalog=catalog)
            if sync_ok:
                console.print(f"[bold green]✓ Successfully synchronized catalog.json on Internet Archive item '{uploader.bucket_name}'.[/bold green]")
            else:
                console.print("[bold yellow]! Notice: Local catalog.json updated, remote upload skipped or failed.[/bold yellow]")

    # Final Summary Table
    summary_table = Table(title="NCERT Pipeline Execution Summary", show_header=True, header_style="bold green")
    summary_table.add_column("Metric", style="white")
    summary_table.add_column("Value", justify="right", style="bold green")

    summary_table.add_row("Catalogue Records Covered", str(stats.get("total_records", 0)))
    summary_table.add_row("Unique Book Archives", str(stats.get("unique_codes", 0)))
    summary_table.add_row("Downloaded & Verified", str(stats.get("downloaded", 0)))
    summary_table.add_row("Cached / Already Verified", str(stats.get("cached", 0)))
    summary_table.add_row("Unpublished on CDN (404)", str(stats.get("not_found", 0)))
    summary_table.add_row("Download Failures", str(stats.get("failed", 0)))
    summary_table.add_row("Elapsed Time", f"{summary.get('elapsed_seconds', 0)}s")
    summary_table.add_row("Manifest File", str(summary.get("manifest_file", args.manifest)))
    if args.upload_to_ia:
        summary_table.add_row("Uploaded to IA", str(uploaded_count))
        summary_table.add_row("Already on IA", str(already_on_ia_count))
        summary_table.add_row("IA Upload Failures", str(upload_failures))
        summary_table.add_row("IA Bucket Item", str(uploader.bucket_name if uploader else "N/A"))

    console.print("\n", summary_table)
    return 0


if __name__ == "__main__":
    sys.exit(main())
