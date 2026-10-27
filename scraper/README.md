# 📚 NovaSlate NCERT Catalogue Discovery & Complete-Book ZIP Pipeline

A high-performance, mathematically verified NCERT textbook discovery, archive streaming, and integrity verification pipeline.

> [!NOTE]
> **Internet Archive (IAS3) Integration & Zero Supabase Catalog Dependency:**
> Books and the authoritative `catalog.json` are hosted directly on Internet Archive S3 (`novaslate-ncert-library`).
> Supabase PostgreSQL catalog table synchronization has been permanently eliminated. NovaSlate loads the catalog directly from `https://archive.org/download/{bucket}/catalog.json` (with local caching in `public/catalog.json`).
> Original archives and publisher notices remain strictly preserved.

---

## ⚡ Key Highlights & Architecture

- **Authoritative Deterministic Static AST Parser**: Parses official NCERT inline JavaScript (`change()` and `change1()`) in under 50ms without headless browser overhead. Strips comments and enforces ladder precedence to completely eliminate ghost books and stale option leakage.
- **Complete-Book ZIP Pipeline**: Fetches official `{code}dd.zip` archives directly from NCERT CDN. Avoids fragmentary chapter PDF downloads unless optional assembly is requested.
- **Cryptographic & Archive Integrity Verification**: Every archive is validated using `zipfile.is_zipfile` and full member CRC32 testing (`ZipFile.testzip()`), alongside SHA-256 digest computation.
- **Intelligent Deduplication**: Correctly tracks books sharing upstream codes (e.g. `gsikr1` shared by *Kriti-I (Sindhi)* and *Kriti-I (Telugu)* in Class VII Arts) so the archive is downloaded only once while preserving all catalogue records.
- **Zero Publisher Notice Modification**: Strictly preserves publisher notices, copyright pages, and original archives. Watermark removal is completely disabled.
- **Resilient Chunked Streaming**: Downloads with exponential backoff, jitter, and HTTP `Range` header resumption.
- **Atomic Operations**: All manifests and book archives use temporary files (`.part` / `.tmp`) with atomic rename (`os.replace`) to prevent corrupted states.

---

## 📊 Verified Catalogue Metrics

| Metric | Verified Value | Notes |
| :--- | :--- | :--- |
| **Classes Covered** | **13** | Class I through Class XII + Combined Class XI & XII |
| **Total Valid Records** | **1,067** | Exact 100% convergence across independent audited crawls |
| **Unique Book Codes** | **1,066** | Code `gsikr1` shared by Sindhi & Telugu in Class VII Arts |
| **Documented Failures** | **1** | `Class IX -> ICT -> Coming Soon` (unreleased placeholder) |
| **Total Baseline Combinations** | **1,068** | 1,067 verified active books + 1 documented failure |
| **Archive URL Format** | `https://ncert.nic.in/textbook/pdf/{code}dd.zip` | Complete-book official archive |

---

## 🛠️ CLI Usage & Operational Commands

### 1. Installation

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Catalogue Discovery (`scraper.py`)

Run the static AST scraper against the authoritative offline fixture or live portal:

```bash
# Deterministic offline run using fixture
python scraper/scraper.py --fixture scraper/tests/fixtures/textbook.php.html

# Live portal scrape
python scraper/scraper.py

# Live scrape with CDN sample probing (e.g. 15 books)
python scraper/scraper.py --validate-cdn --cdn-sample-size 15
```

### 3. Complete-Book Downloader (`download_books.py`)

```bash
# Dry run: preview planned downloads without network traffic
python scraper/download_books.py --class 10 --dry-run

# Dry run for a specific subject
python scraper/download_books.py --class 10 --subject Mathematics --dry-run

# Download all books for a specific class with 4 concurrent workers
python scraper/download_books.py --class 10 --out downloads --manifest download_manifest.json --concurrency 4

# Download specific book codes
python scraper/download_books.py --books aemr1,jemh1 --out downloads

# Safe testing with limit
python scraper/download_books.py --class 1 --limit 2 --dry-run
```

### 4. Unified Pipeline Entry Point (`main.py`)

```bash
# Dry run across Class 10
python scraper/main.py --class 10 --dry-run

# Download Class 10 books into downloads/
python scraper/main.py --class 10 --out downloads

# Download Class 12 Physics books and optionally assemble unified PDF
python scraper/main.py --class 12 --subject Physics --assemble-pdf --out downloads

# Download, assemble, and upload to Internet Archive (and update catalog.json)
python scraper/main.py --class 10 --subject Mathematics --assemble-pdf --upload-to-ia

# Synchronize authoritative catalog.json to Internet Archive root without downloading
python scraper/main.py --sync-catalog
```

### 5. Internet Archive Uploader & Synchronizer (`ia_uploader.py`)

```bash
# Synchronize verified catalog.json manifest to IA item root and local public/catalog.json
python scraper/ia_uploader.py --sync-catalog

# Upload an entire directory of assembled books to IA item
python scraper/ia_uploader.py --upload-dir downloads/ --concurrency 4
```

---

## 🧪 Testing & Verification

Run the full automated test suite (37 unit and regression tests):

```bash
python -m unittest discover -s scraper/tests
```

All tests pass deterministically without initiating unprompted full-catalogue downloads.
