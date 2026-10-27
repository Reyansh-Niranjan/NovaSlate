"""Unit tests for Internet Archive Uploader and Catalog Synchronizer."""

import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import MagicMock, patch

from ia_uploader import IAUploader, DEFAULT_BUCKET


class TestIAUploader(unittest.TestCase):
    def setUp(self):
        self.uploader = IAUploader(
            ia_access_key="test_access_key",
            ia_secret_key="test_secret_key",
            bucket_name="test-bucket",
        )

    def test_ia_auth_header(self):
        """Verifies LOW authorization header format required by Internet Archive S3."""
        self.assertTrue(self.uploader.is_ia_configured())
        self.assertEqual(self.uploader._ia_auth_header(), "LOW test_access_key:test_secret_key")

    def test_get_public_url(self):
        """Verifies URL generation and URL path encoding."""
        url = self.uploader.get_public_url("Class 10/Mathematics/Mathematics (Part 1).pdf")
        self.assertEqual(
            url,
            "https://archive.org/download/test-bucket/Class%2010/Mathematics/Mathematics%20(Part%201).pdf",
        )

    def test_build_catalog_manifest_structure(self):
        """Verifies manifest schema from catalogue dictionary."""
        mock_catalog = {
            "meta": {"total_books": 2},
            "Class 10": {
                "Mathematics": [
                    {"code": "jemh1", "title": "Mathematics", "class": "Class 10", "subject": "Mathematics"}
                ]
            },
        }

        with patch.object(self.uploader, "fetch_existing_files", return_value={"Class 10/Mathematics/Mathematics.pdf": 5000000}):
            manifest = self.uploader.build_catalog_manifest(catalog=mock_catalog)

        meta = manifest.get("meta", {})
        self.assertEqual(meta.get("total_books"), 1)
        self.assertEqual(meta.get("total_uploaded_books"), 1)
        self.assertEqual(meta.get("total_storage_bytes"), 5000000)
        self.assertEqual(meta.get("ia_item"), "test-bucket")

        classes = manifest.get("classes", [])
        self.assertEqual(len(classes), 1)
        self.assertEqual(classes[0]["class"], "Class 10")
        book = classes[0]["subjects"][0]["books"][0]
        self.assertEqual(book["code"], "jemh1")
        self.assertTrue(book["is_available"])
        self.assertEqual(book["size"], 5000000)

    @patch("requests.Session.put")
    def test_upload_file_with_307_redirect(self, mock_put):
        """Verifies S3 PUT upload handling of 307 temporary redirect to IA storage server."""
        # 1st response: 307 redirect
        resp_307 = MagicMock()
        resp_307.status_code = 307
        resp_307.headers = {"Location": "https://ia600100.us.archive.org/test-bucket/test.pdf"}

        # 2nd response: 200 OK
        resp_200 = MagicMock()
        resp_200.status_code = 200

        mock_put.side_effect = [resp_307, resp_200]

        with tempfile.NamedTemporaryFile("wb", suffix=".pdf", delete=False) as tmp:
            tmp.write(b"%PDF-1.4 mock content")
            tmp_path = Path(tmp.name)

        try:
            ok = self.uploader.upload_file(tmp_path, "Class 10/Math.pdf")
            self.assertTrue(ok)
            self.assertEqual(mock_put.call_count, 2)
            # Check headers on initial request
            headers = mock_put.call_args_list[0][1]["headers"]
            self.assertEqual(headers["Authorization"], "LOW test_access_key:test_secret_key")
            self.assertEqual(headers["x-archive-queue-derive"], "0")
        finally:
            tmp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    unittest.main()
