"""Integration tests for Ultimate NCERT Scraper against live portal and CDN."""

import json
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ncert_scraper import (
    NcertParser,
    fetch_url_with_retry,
    probe_cdn_resource,
    run_scraper,
)


class TestNcertScraperIntegration(unittest.TestCase):
    def test_live_cdn_resource_probe(self):
        """Verify that known valid book code 'aemr1' (Mridang Class I) exists on CDN."""
        exists, note = probe_cdn_resource("aemr1", timeout=15)
        self.assertTrue(exists, f"Expected aemr1 to exist on NCERT CDN, but got: {note}")

    def test_live_cdn_404_on_invalid_code(self):
        """Verify that invalid book code returns False on CDN."""
        exists, note = probe_cdn_resource("invalid_fake_code_999", timeout=15)
        self.assertFalse(exists, f"Expected invalid code to fail on CDN, but got: {note}")

    def test_end_to_end_run_with_checkpoint(self):
        """Verify complete run using fixture with checkpoint generation."""
        fixture_path = Path(__file__).resolve().parent / "fixtures" / "textbook.php.html"
        out_file = Path(__file__).resolve().parent / "temp_output.json"
        fail_file = Path(__file__).resolve().parent / "temp_failed.json"
        ckpt_file = Path(__file__).resolve().parent / "temp_checkpoint.json"

        try:
            status = run_scraper(
                fixture_path=fixture_path,
                output_path=out_file,
                failures_path=fail_file,
                checkpoint_path=ckpt_file,
                validate_cdn=False,
            )
            self.assertEqual(status, 0)
            self.assertTrue(out_file.exists())
            self.assertTrue(fail_file.exists())
            self.assertTrue(ckpt_file.exists())

            with open(out_file, "r", encoding="utf-8") as f:
                out_data = json.load(f)
            self.assertEqual(out_data["total_books"], 1067)
            self.assertEqual(len(out_data["books"]), 1067)

            with open(ckpt_file, "r", encoding="utf-8") as f:
                ckpt_data = json.load(f)
            self.assertEqual(ckpt_data["total_records"], 1067)
            self.assertEqual(len(ckpt_data["classes_covered"]), 13)

        finally:
            for p in (out_file, fail_file, ckpt_file):
                if p.exists():
                    p.unlink()


if __name__ == "__main__":
    unittest.main()
