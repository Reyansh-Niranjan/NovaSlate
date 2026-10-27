"""Comprehensive unit and regression tests for Ultimate NCERT Scraper."""

import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ncert_scraper import (
    BOOK_CODE_PATTERN,
    CatalogueRecord,
    FailureRecord,
    NcertParser,
    SelectionPath,
    atomic_write_json,
    normalize_whitespace,
    probe_cdn_resource,
    strip_javascript_comments,
)


FIXTURE_PATH = Path(__file__).resolve().parent / "fixtures" / "textbook.php.html"


class TestNcertScraper(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not FIXTURE_PATH.exists():
            raise unittest.SkipTest("Authoritative HTML fixture textbook.php.html not found")
        cls.fixture_html = FIXTURE_PATH.read_text(encoding="utf-8")
        cls.parser = NcertParser(cls.fixture_html, source_url="fixture://textbook.php.html")

    def test_comment_stripping(self):
        sample_js = """
        // document.test.tbook.options[1].text = "Old Book";
        document.test.tbook.options[1].text = "Active Book"; /* block comment */
        /*
           multi-line comment
           document.test.tbook.options[2].text = "Dead Book";
        */
        """
        clean = strip_javascript_comments(sample_js)
        self.assertNotIn("Old Book", clean)
        self.assertNotIn("Dead Book", clean)
        self.assertIn("Active Book", clean)

    def test_class_mapping_extraction(self):
        class_map = self.parser.extract_class_mapping()
        self.assertEqual(len(class_map), 13)
        self.assertEqual(class_map.get("1"), "Class I")
        self.assertEqual(class_map.get("10"), "Class X")
        self.assertEqual(class_map.get("12"), "Class XII")
        self.assertEqual(class_map.get("13"), "Class XI & XII Combined")

    def test_change_valid_subjects(self):
        class_map = self.parser.extract_class_mapping()
        valid_subjs = self.parser.extract_change_subjects(class_map)
        
        # Class I must have exactly English, Mathematics, Hindi, Urdu
        class1_subjs = valid_subjs.get("1")
        self.assertIsNotNone(class1_subjs)
        self.assertEqual(class1_subjs, {"English", "Mathematics", "Hindi", "Urdu"})

        # Class IX must include ICT
        class9_subjs = valid_subjs.get("9")
        self.assertIn("ICT", class9_subjs)

    def test_full_catalogue_counts_and_convergence(self):
        records, failures = self.parser.parse_catalogue()
        
        # Must exactly match the verified ground truth of 1067 books and 1 failure
        self.assertEqual(len(records), 1067, f"Expected 1067 records, got {len(records)}")
        self.assertEqual(len(failures), 1, f"Expected 1 failure, got {len(failures)}")

        # Check the failure record
        fail = failures[0]
        self.assertEqual(fail.path["class"], "Class IX")
        self.assertEqual(fail.path["subject"], "ICT")
        self.assertEqual(fail.path["book"], "Coming Soon")
        self.assertFalse(fail.retryable)

    def test_book_code_regex_validation(self):
        records, _ = self.parser.parse_catalogue()
        for rec in records:
            self.assertTrue(
                BOOK_CODE_PATTERN.match(rec.book_code),
                f"Invalid book code format: {rec.book_code}",
            )

    def test_dual_mapping_edge_case_gsikr1(self):
        """Class VII Arts has Kriti-I in Sindhi and Telugu both mapped to gsikr1."""
        records, _ = self.parser.parse_catalogue()
        gsikr1_books = [r for r in records if r.book_code == "gsikr1"]
        self.assertEqual(len(gsikr1_books), 2)
        titles = {r.book for r in gsikr1_books}
        self.assertEqual(titles, {"Kriti-I (Sindhi)", "Kriti-I (Telugu)"})

    def test_no_commented_out_books_leaked(self):
        """Verify that commented-out titles like 'Marigold' in Class I do not appear."""
        records, _ = self.parser.parse_catalogue()
        class1_english = [
            r for r in records if r.class_name == "Class I" and r.subject == "English"
        ]
        titles = [r.book for r in class1_english]
        self.assertIn("Mridang", titles)
        self.assertNotIn("Marigold", titles)
        self.assertNotIn("Raindrops", titles)

    def test_no_dead_old_syllabus_blocks_leaked(self):
        """Verify that Class VIII Hindi only contains NEP 2020 'Malhar', not old 'Vasant'."""
        records, _ = self.parser.parse_catalogue()
        class8_hindi = [
            r for r in records if r.class_name == "Class VIII" and r.subject == "Hindi"
        ]
        titles = [r.book for r in class8_hindi]
        self.assertEqual(titles, ["Malhar"])
        self.assertNotIn("Vasant", titles)
        self.assertNotIn("Bharat Ki Khoj", titles)

    def test_atomic_write_json(self):
        with tempfile.TemporaryDirectory() as td:
            target = Path(td) / "sub" / "test.json"
            data = {"key": "value", "count": 1067}
            atomic_write_json(target, data)
            self.assertTrue(target.exists())
            with open(target, "r", encoding="utf-8") as f:
                loaded = json.load(f)
            self.assertEqual(loaded, data)

    def test_whitespace_normalization(self):
        self.assertEqual(normalize_whitespace("  Words   and   Expressions  2  "), "Words and Expressions 2")
        self.assertEqual(normalize_whitespace("Kriti-I&nbsp;(Sindhi)"), "Kriti-I (Sindhi)")


if __name__ == "__main__":
    unittest.main()
