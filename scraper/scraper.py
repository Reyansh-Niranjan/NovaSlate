#!/usr/bin/env python3
"""Ultimate NCERT Scraper CLI and Module Entry Point.

Alias and wrapper around ncert_scraper.py for convenient import and execution.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add scraper directory to path
sys.path.insert(0, str(Path(__file__).parent))

from ncert_scraper import (
    BOOK_CODE_PATTERN,
    CatalogueRecord,
    FailureRecord,
    NcertParser,
    SelectionPath,
    atomic_write_json,
    normalize_whitespace,
    probe_cdn_resource,
    run_scraper,
    strip_javascript_comments,
    main,
)

__all__ = [
    "BOOK_CODE_PATTERN",
    "CatalogueRecord",
    "FailureRecord",
    "NcertParser",
    "SelectionPath",
    "atomic_write_json",
    "normalize_whitespace",
    "probe_cdn_resource",
    "run_scraper",
    "strip_javascript_comments",
    "main",
]

if __name__ == "__main__":
    sys.exit(main())
