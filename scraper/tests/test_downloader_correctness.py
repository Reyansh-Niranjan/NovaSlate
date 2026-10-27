"""Deep correctness and robustness tests for download_books.py."""

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

from download_books import (
    BookDownloader,
    compute_sha256,
    download_book_archive,
    get_book_zip_url,
    normalize_class_key,
    verify_zip_archive,
)
from downloader import sanitize_filename
from ncert_scraper import BOOK_CODE_PATTERN


class TestDownloaderDeepCorrectness(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp(prefix="ncert_correctness_"))

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def _create_test_zip(self, file_path: Path, filename: str = "test.pdf", content: bytes = b"%PDF-1.4 test") -> Path:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(file_path, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr(filename, content)
        return file_path

    @patch("urllib.request.urlopen")
    def test_range_resume_request_headers(self, mock_urlopen):
        """When .part file exists, downloader must send HTTP Range header."""
        part_path = self.test_dir / "test1dd.zip.part"
        part_path.write_bytes(b"initial 10 bytes")
        self.assertEqual(part_path.stat().st_size, 16)

        # Mock server returning 206 Partial Content
        # We need second chunk to complete a valid zip
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("test1ps.pdf", b"%PDF-1.4 chapter 1")
        full_zip_bytes = buf.getvalue()

        # Let's say part_path had the first 20 bytes
        part_path.write_bytes(full_zip_bytes[:20])
        remaining_bytes = full_zip_bytes[20:]

        mock_resp = MagicMock()
        mock_resp.status = 206
        mock_resp.read.side_effect = [remaining_bytes, b""]
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        dest = self.test_dir / "test1dd.zip"
        ok, meta = download_book_archive("test1", dest, max_retries=1)

        # Verify Range header was in request
        called_req = mock_urlopen.call_args[0][0]
        self.assertEqual(called_req.get_header("Range"), "bytes=20-")
        self.assertTrue(ok)
        self.assertEqual(meta["status"], "downloaded")
        self.assertTrue(dest.exists())
        self.assertEqual(dest.read_bytes(), full_zip_bytes)

    @patch("urllib.request.urlopen")
    def test_server_ignores_range_returns_200(self, mock_urlopen):
        """If server returns 200 instead of 206, file must be truncated and rewritten from 0."""
        part_path = self.test_dir / "test2dd.zip.part"
        part_path.write_bytes(b"stale partial bytes from previous session")

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("test2ps.pdf", b"%PDF-1.4 fresh content")
        full_zip_bytes = buf.getvalue()

        # Server returns 200 OK (ignored Range)
        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.side_effect = [full_zip_bytes, b""]
        mock_urlopen.return_value.__enter__.return_value = mock_resp

        dest = self.test_dir / "test2dd.zip"
        ok, meta = download_book_archive("test2", dest, max_retries=1)

        self.assertTrue(ok)
        self.assertEqual(meta["status"], "downloaded")
        # Verify destination matches exactly full_zip_bytes (not corrupted by prepended stale bytes)
        self.assertEqual(dest.read_bytes(), full_zip_bytes)

    @patch("urllib.request.urlopen")
    def test_http_416_range_not_satisfiable_resets_part_file(self, mock_urlopen):
        """HTTP 416 must reset corrupted/oversized .part file and retry."""
        part_path = self.test_dir / "test3dd.zip.part"
        part_path.write_bytes(b"oversized bytes causing 416")

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("test3ps.pdf", b"%PDF-1.4 content")
        full_zip_bytes = buf.getvalue()

        err_416 = urllib.error.HTTPError(
            url="https://ncert.nic.in/textbook/pdf/test3dd.zip",
            code=416,
            msg="Range Not Satisfiable",
            hdrs=None,
            fp=io.BytesIO(b""),
        )
        mock_resp_success = MagicMock()
        mock_resp_success.status = 200
        mock_resp_success.read.side_effect = [full_zip_bytes, b""]

        # First attempt raises 416, second attempt succeeds with 200
        mock_urlopen.side_effect = [err_416, MagicMock(__enter__=MagicMock(return_value=mock_resp_success))]

        dest = self.test_dir / "test3dd.zip"
        ok, meta = download_book_archive("test3", dest, max_retries=2, backoff_factor=1.0)
        self.assertTrue(ok)
        self.assertEqual(dest.read_bytes(), full_zip_bytes)

    def test_existing_valid_archive_not_redownloaded(self):
        """Valid existing archive must be recognized as 'cached' without redownloading."""
        dest = self.test_dir / "cached1dd.zip"
        self._create_test_zip(dest, "cached1.pdf", b"%PDF-1.4 cached")
        orig_mtime = dest.stat().st_mtime

        with patch("urllib.request.urlopen") as mock_urlopen:
            ok, meta = download_book_archive("cached1", dest)
            self.assertTrue(ok)
            self.assertEqual(meta["status"], "cached")
            mock_urlopen.assert_not_called()
            self.assertEqual(dest.stat().st_mtime, orig_mtime)

    def test_existing_corrupted_archive_triggers_replacement(self):
        """Corrupted existing archive must not be cached; must trigger download & atomic replace."""
        dest = self.test_dir / "bad1dd.zip"
        dest.write_bytes(b"garbage corrupted file")

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("bad1ps.pdf", b"%PDF-1.4 fixed content")
        valid_bytes = buf.getvalue()

        mock_resp = MagicMock()
        mock_resp.status = 200
        mock_resp.read.side_effect = [valid_bytes, b""]

        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_urlopen.return_value.__enter__.return_value = mock_resp
            ok, meta = download_book_archive("bad1", dest, max_retries=1)
            self.assertTrue(ok)
            self.assertEqual(meta["status"], "downloaded")
            self.assertEqual(dest.read_bytes(), valid_bytes)

    def test_path_sanitization_and_book_code_validation(self):
        """Sanitization removes dangerous traversal chars; codes must match pattern."""
        self.assertEqual(sanitize_filename("../../etc/passwd"), "etcpasswd")
        self.assertEqual(sanitize_filename("Class 10: Science & Tech / Intro"), "Class 10 Science  Tech  Intro")
        self.assertTrue(BOOK_CODE_PATTERN.match("aemr1"))
        self.assertTrue(BOOK_CODE_PATTERN.match("gsikr1"))
        self.assertFalse(BOOK_CODE_PATTERN.match("../code"))
        self.assertFalse(BOOK_CODE_PATTERN.match("code with space"))
        self.assertFalse(BOOK_CODE_PATTERN.match("x"))  # too short (<3)

    def test_concurrency_bounded_clamp(self):
        """Concurrency must be clamped between 1 and 16."""
        d_low = BookDownloader(concurrency=0)
        self.assertEqual(d_low.concurrency, 1)
        d_high = BookDownloader(concurrency=100)
        self.assertEqual(d_high.concurrency, 16)
        d_normal = BookDownloader(concurrency=6)
        self.assertEqual(d_normal.concurrency, 6)

    def test_class_normalization_all_classes(self):
        """Roman numerals, integers, and 'Class X' strings must normalize consistently."""
        self.assertEqual(normalize_class_key("1"), "1")
        self.assertEqual(normalize_class_key("Class I"), "1")
        self.assertEqual(normalize_class_key("class 1"), "1")
        self.assertEqual(normalize_class_key("10"), "10")
        self.assertEqual(normalize_class_key("Class X"), "10")
        self.assertEqual(normalize_class_key("12"), "12")
        self.assertEqual(normalize_class_key("Class XII"), "12")


if __name__ == "__main__":
    unittest.main()
