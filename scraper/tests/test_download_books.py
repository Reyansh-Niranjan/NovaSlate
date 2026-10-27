"""Comprehensive automated tests for NCERT book downloader and archive verifier."""

import io
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import MagicMock, patch
import urllib.error
import zipfile

# Add scraper directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from catalog import fetch_catalog, iter_books
from download_books import (
    BookDownloader,
    compute_sha256,
    download_book_archive,
    get_book_zip_url,
    verify_zip_archive,
)
from ncert_scraper import BOOK_CODE_PATTERN


class TestCatalogueIntegrity(unittest.TestCase):
    """Verify catalogue baseline counts, classes, and duplicate mappings."""

    @classmethod
    def setUpClass(cls):
        cls.catalog = fetch_catalog()

    def test_catalogue_counts(self):
        meta = self.catalog["meta"]
        self.assertEqual(meta["total_books"], 1067)
        self.assertEqual(meta["unique_codes"], 1066)
        self.assertEqual(meta["total_classes"], 13)

    def test_dual_mapping_gsikr1(self):
        """gsikr1 must map to exactly two distinct titles in Class VII Arts."""
        self.assertIn("gsikr1", self.catalog["by_code"])
        entries = self.catalog["by_code"]["gsikr1"]
        self.assertEqual(len(entries), 2)
        titles = {e["title"] for e in entries}
        self.assertEqual(titles, {"Kriti-I (Sindhi)", "Kriti-I (Telugu)"})
        classes = {e["class"] for e in entries}
        self.assertEqual(classes, {"Class VII"})
        subjects = {e["subject"] for e in entries}
        self.assertEqual(subjects, {"Arts"})

    def test_complete_book_zip_urls(self):
        """All books must point to official {code}dd.zip URLs."""
        for cls_name, subj_name, book in iter_books(self.catalog):
            code = book["code"]
            self.assertTrue(BOOK_CODE_PATTERN.match(code))
            expected_url = f"https://ncert.nic.in/textbook/pdf/{code}dd.zip"
            self.assertEqual(book["zip_url"], expected_url)
            self.assertTrue(book["zip_file"].endswith("dd.zip"))


class TestArchiveValidationAndRecovery(unittest.TestCase):
    """Test ZIP integrity, corrupted archives, 404 handling, and resume."""

    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp(prefix="ncert_test_"))

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def _create_valid_sample_zip(self, file_path: Path) -> Path:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(file_path, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("aemr1ps.pdf", b"%PDF-1.4 sample prelims content")
            zf.writestr("aemr101.pdf", b"%PDF-1.4 chapter 1 content")
        return file_path

    def test_verify_zip_archive_valid(self):
        sample_zip = self.test_dir / "valid.zip"
        self._create_valid_sample_zip(sample_zip)
        ok, msg = verify_zip_archive(sample_zip)
        self.assertTrue(ok, f"Expected valid zip, got: {msg}")
        self.assertIn("Verified valid ZIP", msg)

    def test_verify_zip_archive_corrupted_non_zip(self):
        corrupt_file = self.test_dir / "corrupt.zip"
        corrupt_file.write_bytes(b"This is not a zip file at all")
        ok, msg = verify_zip_archive(corrupt_file)
        self.assertFalse(ok)
        self.assertIn("magic signature mismatch", msg)

    def test_verify_zip_archive_corrupted_crc(self):
        """ZIP file with damaged compressed data triggers CRC error."""
        valid_zip = self.test_dir / "crc_test.zip"
        self._create_valid_sample_zip(valid_zip)
        raw = bytearray(valid_zip.read_bytes())
        # Corrupt data midway through the file
        raw[len(raw) // 2] ^= 0xFF
        corrupt_zip = self.test_dir / "crc_corrupt.zip"
        corrupt_zip.write_bytes(raw)

        ok, msg = verify_zip_archive(corrupt_zip)
        self.assertFalse(ok)

    def test_verify_zip_archive_missing_pdf(self):
        no_pdf_zip = self.test_dir / "no_pdf.zip"
        with zipfile.ZipFile(no_pdf_zip, "w") as zf:
            zf.writestr("readme.txt", "No PDF here")
        ok, msg = verify_zip_archive(no_pdf_zip)
        self.assertFalse(ok)
        self.assertIn("contains no PDF chapter files", msg)

    def test_sha256_computation(self):
        sample_file = self.test_dir / "sha_test.txt"
        sample_file.write_bytes(b"NovaSlate NCERT Downloader Test")
        sha = compute_sha256(sample_file)
        # Expected SHA-256 for this exact string
        import hashlib
        expected = hashlib.sha256(b"NovaSlate NCERT Downloader Test").hexdigest()
        self.assertEqual(sha, expected)

    @patch("urllib.request.urlopen")
    def test_download_mocked_404_not_found(self, mock_urlopen):
        """HTTP 404 should return not_found status without endless retrying."""
        err = urllib.error.HTTPError(
            url="https://ncert.nic.in/textbook/pdf/unknown99dd.zip",
            code=404,
            msg="Not Found",
            hdrs=None,
            fp=io.BytesIO(b""),
        )
        mock_urlopen.side_effect = err

        dest = self.test_dir / "unknown99dd.zip"
        ok, meta = download_book_archive("unknown99", dest, max_retries=2)
        self.assertFalse(ok)
        self.assertEqual(meta["status"], "not_found")
        self.assertFalse(dest.exists())
        self.assertFalse((self.test_dir / "unknown99dd.zip.part").exists())

    @patch("urllib.request.urlopen")
    def test_download_mocked_success(self, mock_urlopen):
        """Mocked successful download with valid ZIP byte payload."""
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("mock1ps.pdf", b"%PDF-1.4 mock prelim")
            zf.writestr("mock101.pdf", b"%PDF-1.4 mock ch1")
        zip_bytes = buf.getvalue()

        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.side_effect = [zip_bytes, b""]
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        dest = self.test_dir / "mock1dd.zip"
        ok, meta = download_book_archive("mock1", dest, max_retries=1)
        self.assertTrue(ok)
        self.assertEqual(meta["status"], "downloaded")
        self.assertTrue(dest.exists())
        self.assertEqual(meta["size_bytes"], len(zip_bytes))
        self.assertEqual(meta["sha256"], compute_sha256(dest))


class TestDownloaderDeduplicationAndManifest(unittest.TestCase):
    """Test deduplication of duplicate mappings (gsikr1) and manifest structure."""

    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp(prefix="ncert_dedup_"))

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_deduplication_grouping(self):
        downloader = BookDownloader(output_dir=self.test_dir)
        records = [
            {"class": "Class VII", "subject": "Arts", "book": "Kriti-I (Sindhi)", "book_code": "gsikr1"},
            {"class": "Class VII", "subject": "Arts", "book": "Kriti-I (Telugu)", "book_code": "gsikr1"},
            {"class": "Class I", "subject": "English", "book": "Mridang", "book_code": "aemr1"},
        ]
        grouped = downloader.group_by_unique_code(records)
        self.assertEqual(len(grouped), 2)
        self.assertIn("gsikr1", grouped)
        self.assertIn("aemr1", grouped)
        self.assertEqual(len(grouped["gsikr1"]), 2)
        titles = {r["book"] for r in grouped["gsikr1"]}
        self.assertEqual(titles, {"Kriti-I (Sindhi)", "Kriti-I (Telugu)"})

    def test_dry_run_execution(self):
        manifest_file = self.test_dir / "manifest.json"
        downloader = BookDownloader(
            output_dir=self.test_dir,
            manifest_path=manifest_file,
        )
        res = downloader.run(class_filter="1", dry_run=True)
        self.assertTrue(res["dry_run"])
        self.assertEqual(res["total_records"], 26)
        self.assertEqual(res["unique_codes"], 26)
        self.assertEqual(len(res["planned_downloads"]), 26)
        # Verify no files were written to disk in dry-run
        self.assertFalse(manifest_file.exists())
        self.assertEqual(len(list(self.test_dir.glob("*.zip"))), 0)


if __name__ == "__main__":
    unittest.main()
