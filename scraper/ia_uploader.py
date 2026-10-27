#!/usr/bin/env python3
"""Internet Archive S3 (IAS3) Uploader & Catalog Synchronizer.

Uploads textbook archives/PDFs directly to Internet Archive (IAS3) and synchronizes
the authoritative catalog.json to the Internet Archive item root.
Supabase catalog synchronization has been permanently removed.
"""

from __future__ import annotations

import argparse
import concurrent.futures
from datetime import datetime, timezone
import json
import logging
import os
from pathlib import Path
import tempfile
import time
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote

from dotenv import load_dotenv
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Add module to path
import sys
sys.path.insert(0, str(Path(__file__).parent))

from catalog import fetch_catalog, iter_books, normalize_class_key
from download_books import atomic_write_json

logger = logging.getLogger("ncert_scraper.ia")

DEFAULT_BUCKET = "novaslate-ncert-library"

# Load local environment
load_dotenv()
load_dotenv(Path(__file__).parent.parent / ".env.local")
load_dotenv(Path(__file__).parent.parent / ".env")


class IAUploader:
    """Manages uploading textbook files and catalog.json directly to Internet Archive (IAS3)."""

    def __init__(
        self,
        ia_access_key: Optional[str] = None,
        ia_secret_key: Optional[str] = None,
        bucket_name: Optional[str] = None,
    ):
        self.access_key = ia_access_key or os.getenv("IA_ACCESS_KEY")
        self.secret_key = ia_secret_key or os.getenv("IA_SECRET_KEY")
        self.bucket_name = (
            bucket_name
            or os.getenv("IA_BUCKET")
            or os.getenv("IA_ITEM_IDENTIFIER")
            or DEFAULT_BUCKET
        )

        self._remote_files: Optional[Dict[str, int]] = None

        self.session = requests.Session()
        retries = Retry(
            total=4,
            backoff_factor=1.5,
            status_forcelist=[500, 502, 503, 504, 408, 429],
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=32, pool_maxsize=32)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

        if self.is_ia_configured():
            logger.info("Internet Archive S3 initialized for item: %s", self.bucket_name)
        else:
            logger.warning("Internet Archive credentials (IA_ACCESS_KEY, IA_SECRET_KEY) not found.")

    def is_ia_configured(self) -> bool:
        return bool(self.access_key and self.secret_key)

    def is_configured(self) -> bool:
        return self.is_ia_configured()

    def _ia_auth_header(self) -> str:
        return f"LOW {self.access_key}:{self.secret_key}"

    def get_public_url(self, remote_path: str) -> str:
        """Returns direct public download URL on Internet Archive."""
        clean_path = remote_path.replace("\\", "/").strip("/")
        safe_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in clean_path.split("/"))
        return f"https://archive.org/download/{self.bucket_name}/{safe_path}"

    def fetch_existing_files(self, refresh: bool = False) -> Dict[str, int]:
        """Fetch list of all files already present in the Internet Archive item."""
        if self._remote_files is not None and not refresh:
            return self._remote_files

        collected: Dict[str, int] = {}
        metadata_url = f"https://archive.org/metadata/{self.bucket_name}/files"

        try:
            resp = self.session.get(metadata_url, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                for f in data.get("result", []):
                    name = f.get("name", "")
                    size_val = f.get("size", 0)
                    try:
                        size = int(size_val)
                    except (ValueError, TypeError):
                        size = 0
                    if name:
                        collected[name.strip("/")] = size
        except Exception as e:
            logger.warning("Could not query Internet Archive metadata files: %s", e)

        self._remote_files = collected
        logger.info("Found %d files in Internet Archive item '%s'", len(collected), self.bucket_name)
        return collected

    def exists(self, remote_path: str) -> bool:
        """Check if file exists in Internet Archive item with non-zero size."""
        clean_path = remote_path.replace("\\", "/").strip("/")
        remote_files = self.fetch_existing_files()

        if clean_path in remote_files and remote_files[clean_path] > 0:
            return True

        if not self.is_ia_configured():
            return False

        # Fallback HEAD check on S3 endpoint
        safe_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in clean_path.split("/"))
        head_url = f"https://s3.us.archive.org/{self.bucket_name}/{safe_path}"
        headers = {"Authorization": self._ia_auth_header()}
        try:
            resp = self.session.head(head_url, headers=headers, timeout=15, allow_redirects=True)
            if resp.status_code == 200:
                sz = int(resp.headers.get("Content-Length", 0))
                if sz > 0:
                    if self._remote_files is not None:
                        self._remote_files[clean_path] = sz
                    return True
        except Exception:
            pass

        return False

    def upload_file(
        self,
        local_path: Path,
        remote_path: str,
        content_type: str = "application/pdf",
        max_retries: int = 4,
    ) -> bool:
        """Upload file directly to Internet Archive S3 with automatic redirect handling."""
        if not self.is_ia_configured():
            logger.error("Cannot upload: Internet Archive credentials missing.")
            return False

        local_path = Path(local_path)
        if not local_path.exists():
            logger.error("Local file does not exist: %s", local_path)
            return False

        clean_remote_path = remote_path.replace("\\", "/").strip("/")
        safe_encoded_path = "/".join(quote(seg, safe="()-_.!~*'()") for seg in clean_remote_path.split("/"))
        api_url = f"https://s3.us.archive.org/{self.bucket_name}/{safe_encoded_path}"

        headers = {
            "Authorization": self._ia_auth_header(),
            "Content-Type": content_type,
            "x-amz-auto-make-bucket": "1",
            "x-archive-meta-mediatype": "texts",
            "x-archive-meta-collection": "opensource",
            "x-archive-meta-title": "NovaSlate NCERT Open Digital Library",
            "x-archive-ignore-preexisting-bucket": "1",
            "x-archive-queue-derive": "0",
        }

        file_size = local_path.stat().st_size

        for attempt in range(1, max_retries + 1):
            try:
                with open(local_path, "rb") as f:
                    resp = self.session.put(
                        api_url,
                        headers=headers,
                        data=f,
                        timeout=300,
                        allow_redirects=False,
                    )

                    # Handle 307 Temporary Redirect to specific IA storage node
                    if resp.status_code == 307:
                        redirect_url = resp.headers.get("Location")
                        if redirect_url:
                            f.seek(0)
                            resp = self.session.put(
                                redirect_url,
                                headers=headers,
                                data=f,
                                timeout=300,
                            )

                if resp.status_code in (200, 201):
                    if self._remote_files is not None:
                        self._remote_files[clean_remote_path] = file_size
                    logger.info("Uploaded to Internet Archive: %s (%d bytes)", clean_remote_path, file_size)
                    return True

                logger.warning(
                    "IAS3 upload attempt %d for '%s' returned HTTP %d: %s",
                    attempt, clean_remote_path, resp.status_code, resp.text[:120]
                )
                time.sleep(2 * attempt)
            except Exception as e:
                logger.warning("IAS3 upload attempt %d for '%s' failed: %s", attempt, clean_remote_path, e)
                time.sleep(2 * attempt)

        logger.error("Failed to upload '%s' to Internet Archive after %d attempts.", clean_remote_path, max_retries)
        return False

    def build_catalog_manifest(
        self,
        catalog: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Build enriched catalog JSON mapping the verified 1,067 records and IA availability."""
        if catalog is None:
            catalog = fetch_catalog()

        remote_files = self.fetch_existing_files()
        enriched_classes = []
        total_books = 0
        total_uploaded = 0
        total_storage_bytes = 0

        # Iterate classes
        for cls_name in catalog.keys():
            if cls_name in ("by_code", "meta") or not isinstance(catalog[cls_name], dict):
                continue

            # Standardize class folder name e.g. "Class 10" or "Class I"
            c_num = normalize_class_key(cls_name)
            class_folder = f"Class {c_num}" if c_num.isdigit() else cls_name

            subjects_dict = catalog[cls_name]
            enriched_subjects = []

            for subj_name, books_list in subjects_dict.items():
                enriched_books = []
                for b in books_list:
                    total_books += 1
                    code = b["code"]
                    title = b["title"]

                    # Check possible remote path names on IA
                    possible_paths = [
                        f"{class_folder}/{subj_name}/{title}.pdf",
                        f"{cls_name}/{subj_name}/{title}.pdf",
                        f"{class_folder}/{subj_name}/{title}.zip",
                        f"{cls_name}/{subj_name}/{title}.zip",
                    ]

                    chosen_path = possible_paths[0]
                    file_size = 0
                    is_uploaded = False

                    for p in possible_paths:
                        if p in remote_files and remote_files[p] > 0:
                            chosen_path = p
                            file_size = remote_files[p]
                            is_uploaded = True
                            break

                    if is_uploaded:
                        total_uploaded += 1
                        total_storage_bytes += file_size

                    public_url = self.get_public_url(chosen_path)

                    enriched_books.append({
                        "code": code,
                        "title": title,
                        "class": cls_name,
                        "subject": subj_name,
                        "path": chosen_path,
                        "url": public_url,
                        "size": file_size,
                        "is_available": is_uploaded,
                    })

                enriched_subjects.append({
                    "name": subj_name,
                    "books": enriched_books,
                })

            enriched_classes.append({
                "class": cls_name,
                "subjects": enriched_subjects,
            })

        # Sort classes naturally
        def _class_sort_key(c_obj):
            num = normalize_class_key(c_obj["class"])
            return int(num) if num.isdigit() else 99

        enriched_classes.sort(key=_class_sort_key)

        manifest = {
            "meta": {
                "version": "4.0.0",
                "app": "NovaSlate",
                "source": "NCERT Official (Static AST Verified)",
                "storage": "Internet Archive (IAS3)",
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "total_classes": len(enriched_classes),
                "total_books": total_books,
                "total_uploaded_books": total_uploaded,
                "total_storage_bytes": total_storage_bytes,
                "ia_item": self.bucket_name,
            },
            "classes": enriched_classes,
        }
        return manifest

    def upload_catalog_manifest(
        self,
        catalog: Optional[Dict[str, Any]] = None,
        remote_name: str = "catalog.json",
        local_export_paths: Optional[List[Path]] = None,
    ) -> bool:
        """Build verified catalog.json, export locally (e.g. public/catalog.json), and upload to IA root."""
        manifest = self.build_catalog_manifest(catalog=catalog)

        # Write to requested local paths (e.g. public/catalog.json)
        paths_to_write = local_export_paths or [
            Path(__file__).parent.parent / "public" / "catalog.json",
            Path(__file__).parent / "catalog.json",
        ]
        for p in paths_to_write:
            try:
                atomic_write_json(p, manifest)
                logger.info("Saved local catalog manifest to %s", p)
            except Exception as e:
                logger.warning("Failed writing local catalog copy to %s: %s", p, e)

        # Upload to Internet Archive S3 root
        if not self.is_ia_configured():
            logger.warning("IA credentials missing; skipped uploading %s to remote IA item.", remote_name)
            return False

        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
            json.dump(manifest, tmp, indent=2, ensure_ascii=False)
            tmp_path = Path(tmp.name)

        try:
            ok = self.upload_file(tmp_path, remote_name, content_type="application/json")
            if ok:
                logger.info("Successfully uploaded '%s' to Internet Archive root item '%s'", remote_name, self.bucket_name)
            return ok
        finally:
            tmp_path.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description="Internet Archive Uploader & Catalog Synchronizer for NovaSlate")
    parser.add_argument("--sync-catalog", action="store_true", help="Generate and upload verified catalog.json to IA")
    parser.add_argument("--file", default=None, help="Local file to upload")
    parser.add_argument("--remote-path", default=None, help="Remote path in IA item")
    parser.add_argument("--upload-dir", default=None, help="Directory of books to upload")
    parser.add_argument("--bucket", default=None, help="Target IA item identifier (default: novaslate-ncert-library)")
    parser.add_argument("--concurrency", "-c", type=int, default=4, help="Concurrent upload threads")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")

    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO, format="%(message)s")

    uploader = IAUploader(bucket_name=args.bucket)

    if args.sync_catalog:
        print("[*] Synchronizing verified NCERT catalog.json to Internet Archive...")
        ok = uploader.upload_catalog_manifest()
        if ok:
            print("[+] Successfully synchronized catalog.json to Internet Archive!")
            return 0
        else:
            print("[!] Failed to synchronize catalog.json to Internet Archive.")
            return 1

    if args.file and args.remote_path:
        print(f"[*] Uploading {args.file} to IA as {args.remote_path}...")
        ok = uploader.upload_file(Path(args.file), args.remote_path)
        return 0 if ok else 1

    if args.upload_dir:
        p = Path(args.upload_dir)
        files_to_upload = list(p.rglob("*.pdf")) + list(p.rglob("*.zip"))
        print(f"[*] Found {len(files_to_upload)} files in {args.upload_dir} to process.")
        with concurrent.futures.ThreadPoolExecutor(max_workers=args.concurrency) as executor:
            def _up(f: Path):
                rel = f.relative_to(p)
                remote = str(rel).replace("\\", "/")
                if uploader.exists(remote):
                    return remote, "already_exists"
                ok = uploader.upload_file(f, remote)
                return remote, "uploaded" if ok else "failed"

            futures = [executor.submit(_up, f) for f in files_to_upload]
            for fut in concurrent.futures.as_completed(futures):
                remote, status = fut.result()
                print(f"  [{status}] {remote}")

        # Update catalog after uploading files
        print("[*] Refreshing catalog.json on Internet Archive...")
        uploader.upload_catalog_manifest()
        return 0

    parser.print_help()
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
