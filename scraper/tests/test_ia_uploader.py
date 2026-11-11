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

    def test_should_upload_sha1_match_and_mismatch(self):
        """Verifies should_upload skips upload if SHA-1 matches, and triggers upload if SHA-1 differs."""
        content = b"%PDF-1.4 mock content with deterministic hash"
        with tempfile.NamedTemporaryFile("wb", suffix=".pdf", delete=False) as tmp:
            tmp.write(content)
            tmp_path = Path(tmp.name)

        try:
            local_sha1 = self.uploader.compute_sha1(tmp_path)

            # Scenario 1: Remote SHA-1 matches local SHA-1 -> SKIP upload
            self.uploader._remote_files_meta = {
                "Class 10/Math.pdf": {"size": len(content), "sha1": local_sha1, "md5": ""}
            }
            should_up, reason = self.uploader.should_upload(tmp_path, "Class 10/Math.pdf")
            self.assertFalse(should_up)
            self.assertIn("SHA-1 match", reason)

            # Scenario 2: Remote SHA-1 differs -> REPLACE on IA
            self.uploader._remote_files_meta = {
                "Class 10/Math.pdf": {"size": len(content), "sha1": "different_hash_0000", "md5": ""}
            }
            should_up, reason = self.uploader.should_upload(tmp_path, "Class 10/Math.pdf")
            self.assertTrue(should_up)
            self.assertIn("SHA-1 mismatch", reason)

            # Scenario 3: File does not exist on IA -> UPLOAD new file
            should_up, reason = self.uploader.should_upload(tmp_path, "Class 10/NewBook.pdf")
            self.assertTrue(should_up)
            self.assertIn("New file", reason)
        finally:
            tmp_path.unlink(missing_ok=True)

    @patch("requests.Session.delete")
    def test_delete_file(self, mock_delete):
        """Verifies S3 DELETE removes file and updates cache."""
        resp_204 = MagicMock()
        resp_204.status_code = 204
        mock_delete.return_value = resp_204

        self.uploader._remote_files = {"Class 10/OldBook.pdf": 100}
        self.uploader._remote_files_meta = {"Class 10/OldBook.pdf": {"size": 100}}

        ok = self.uploader.delete_file("Class 10/OldBook.pdf")
        self.assertTrue(ok)
        self.assertNotIn("Class 10/OldBook.pdf", self.uploader._remote_files)
        self.assertNotIn("Class 10/OldBook.pdf", self.uploader._remote_files_meta)

    @patch.object(IAUploader, "delete_file", return_value=True)
    def test_prune_orphaned_books(self, mock_delete_file):
        """Verifies orphaned IA files not in the active NCERT catalog are identified and pruned."""
        mock_catalog = {
            "Class 10": {
                "Mathematics": [
                    {"code": "jemh1", "title": "Mathematics", "class": "Class 10", "subject": "Mathematics"}
                ]
            }
        }
        # IA has the active Math book AND an old deleted Physics book
        with patch.object(self.uploader, "fetch_existing_files", return_value={
            "Class 10/Mathematics/Mathematics.pdf": 5000,
            "Class 10/Physics/OldDeletedPhysics.pdf": 3000,
            "catalog.json": 1000,  # Protected
        }):
            deleted = self.uploader.prune_orphaned_books(catalog=mock_catalog, dry_run=False)

        self.assertIn("Class 10/Physics/OldDeletedPhysics.pdf", deleted)
        self.assertNotIn("Class 10/Mathematics/Mathematics.pdf", deleted)
        self.assertNotIn("catalog.json", deleted)
        mock_delete_file.assert_called_once_with("Class 10/Physics/OldDeletedPhysics.pdf")


if __name__ == "__main__":
    unittest.main()
