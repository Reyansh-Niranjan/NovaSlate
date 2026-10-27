# IA to NCERT Scraper Migration Report

**Date & Time**: 2026-10-27T21:55:00+05:30  
**Workspace**: NovaSlate (`d:\NovaSlate`)  
**Status**: COMPLETE (Verified & Passing)  

---

## 1. IA Worker Shutdown Results & Verification Evidence

Prior to executing data deletion or code integration, an exhaustive audit of all local and remote processes was conducted to guarantee that all Internet Archive (IA) book-download activity and retry loops were forcefully stopped.

### A. Remote GitHub Actions Matrix Workers
- **Identified Active Workload**:
  - The repository workflow `NCERT Scraper & Internet Archive Replenish` (`.github/workflows/scrape_and_replenish.yml`) had three active runs executing across 12-runner Ubuntu matrix environments with auto-dispatch retry loops:
    - **Run ID 40517933683**: In-progress for >2h 4m
    - **Run ID 40517909164**: In-progress for >2h 4m
    - **Run ID 40517843618**: In-progress for >2h 5m
- **Actions Taken**:
  - Dispatched cancellation signals to all three runs via `gh run cancel <id>`.
  - Verified final status transitioned to `completed cancelled` across all runs.
  - Disabled the GitHub Actions workflow `scrape_and_replenish.yml` (ID `339338711`) using `gh workflow disable`.
  - Disabled legacy orphan workflow ID `274054061` (`.github/workflows/ncert-scrape.yml`).
  - Verified status via `gh workflow list --all`: workflow state is `disabled_manually`.

### B. Local Operating System Processes
- **Process Inspection**:
  - Inspected Windows processes via `Get-CimInstance Win32_Process` filtering for `python`, `node`, `chrome`, `edge`, `aria2`, `curl` and keywords `scraper|novaslate|archive|download|ncert`.
  - Only two Python processes were identified:
    - PID `3164`: `C:\Users\Reyansh\AppData\Local\Programs\Python\Python314\python.exe` (Fusion 360 MCP server)
    - PID `22972`: Fusion 360 MCP virtual environment Python
  - No NovaSlate Python or Node workers were active locally.
- **Antigravity Internal Tasks**:
  - Inspected background tasks via `manage_task(Action='list')`. Verified 0 active background tasks.
- **Scheduled Tasks**:
  - Queried Windows Scheduled Tasks (`Get-ScheduledTask`). Verified zero tasks related to NovaSlate, IA, or book downloaders.
- **Network Connections**:
  - Inspected established TCP connections on ports 80/443 via `Get-NetTCPConnection`. Confirmed zero connections to `archive.org`.

### Summary Shutdown Matrix

| Worker / Identifier | Environment | Prior State | Action Taken | Final Verified State | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Run 40517933683** | GitHub Actions (12 VMs) | In-Progress (>2h) | `gh run cancel` | `completed cancelled` | `gh run list` |
| **Run 40517909164** | GitHub Actions (12 VMs) | In-Progress (>2h) | `gh run cancel` | `completed cancelled` | `gh run list` |
| **Run 40517843618** | GitHub Actions (12 VMs) | In-Progress (>2h) | `gh run cancel` | `completed cancelled` | `gh run list` |
| **scrape_and_replenish.yml** | GitHub Workflow (ID 339338711) | Active / Scheduled | `gh workflow disable` | `disabled_manually` | `gh workflow list --all` |
| **ncert-scrape.yml** | GitHub Workflow (ID 274054061) | Active (Legacy) | `gh workflow disable` | `disabled_manually` | `gh workflow list --all` |
| **Local Background Tasks** | Antigravity Engine | None | Verified | Idle (0 tasks) | `manage_task list` |
| **Local Python Workers** | Windows Host | Fusion 360 MCP | Verified PIDs | Preserved non-project | `Get-CimInstance` |

---

## 2. IA Data Deletion & Inventory

Following shutdown verification, all project-owned Internet Archive artifacts, obsolete un-reconciled manifests, and prohibited scripts were inventoried and permanently removed.

### A. Inventory of Deleted Files

| Target File Path | Purpose | Size (Bytes) | Size (Readable) | Deletion Status |
| :--- | :--- | :--- | :--- | :--- |
| `D:\NovaSlate\scraper\catalog.json` | Obsolete 1,148-record IA catalog (contained 89 retired editions, missed NEP-2020) | 12,167,930 | ~11.60 MB | Confirmed Deleted |
| `D:\NovaSlate\scraper\catalog_seed.json` | Obsolete static seed manifest | 556,114 | ~543.08 KB | Confirmed Deleted |
| `D:\NovaSlate\scraper\ia_uploader.py` | Internet Archive S3 uploader & replenishment script | 15,776 | ~15.41 KB | Confirmed Deleted |
| `D:\NovaSlate\scraper\watermark_remover.py` | Watermark removal script (violated notice preservation policy) | 6,251 | ~6.10 KB | Confirmed Deleted |
| `D:\NovaSlate\.github\workflows\scrape_and_replenish.yml` | IA upload orchestration & retriggering workflow | 10,494 | ~10.25 KB | Confirmed Deleted |
| **Total Disk Space Freed** | | **12,756,565** | **~12.17 MB** | |

### B. Verification of Deletion
- Verified via `Test-Path`: all five paths returned `False`.
- Verified that local book archive directories (`downloads/`, `*.tmp`, `*.part`, `*.marker`, `failed_books.json`, `failed_codes.txt`) contained zero lingering files.
- Preserved all project source code, Git history, frontend UI components, and unrelated user data.

---

## 3. Remaining Data & Non-Project Files

- **Archival Environment Variables**:
  - `.env.local` and `.env.example` retain `IA_ACCESS_KEY`, `IA_SECRET_KEY`, and `IA_BUCKET` definitions. These variables are no longer imported, read, or utilized by any active script in the workspace.
- **Frontend Fallback**:
  - `src/components/NestedLibrary.tsx` retains `getInternetArchiveUrl()` solely as a client-side URL fallback for un-migrated legacy database records. Ingestion and downloading are completely decoupled from it.
- **User Personal Downloads**:
  - `C:\Users\Reyansh\Downloads` contains miscellaneous files from manual browser usage (`iebe1dd.zip`, etc.). These were left untouched in compliance with safety instructions prohibiting modification of personal user data.

---

## 4. Integrated NCERT Scraper & Downloader Files

The new high-performance, mathematically verified Ultimate NCERT Scraper and complete-book ZIP downloader have been integrated into `D:\NovaSlate\scraper`:

```
D:\NovaSlate\scraper/
├── ncert_scraper.py          # Authoritative static AST parser (<50ms, zero browser overhead)
├── scraper.py                # Primary CLI and module wrapper around ncert_scraper.py
├── download_books.py         # Complete-book ZIP downloader with chunked streaming & CRC checks
├── downloader.py             # Refactored downloader module (watermark removal stripped, ZIP preserved)
├── catalog.py                # Re-architected catalog normalizer serving verified 1,067 records
├── optimizer.py              # Pure PDF compression engine (Pillow + PyMuPDF stream deflation)
├── main.py                   # Unified CLI driving the complete pipeline (rejects --upload-to-ia)
├── requirements.txt          # Clean, lightweight dependency configuration
├── README.md                 # Updated operational documentation and command manual
├── ncert_book_codes.json     # 1,067 verified textbook records
├── failed_combinations.json  # 1 documented failure (Class IX ICT placeholder)
├── checkpoint.json           # Resumption checkpoint state
├── data/
│   └── ncert_book_codes.json # Redundant canonical copy
└── tests/
    ├── fixtures/
    │   └── textbook.php.html # Authoritative offline NCERT portal HTML fixture
    ├── test_ncert_scraper.py # Unit tests for AST parser, comment stripping, ladder precedence
    ├── test_download_books.py# Downloader tests (ZIP verification, resume, mocks, manifest)
    └── test_integration.py   # Live CDN probe integration tests
```

---

## 5. Verified Catalogue Baseline

- **Total Catalogue Combinations**: **1,068**
- **Verified Active Textbook Records**: **1,067**
- **Documented Unreleased Failures**: **1** (`Class IX -> ICT -> Coming Soon`, empty dropdown value)
- **Classes Covered**: **13** (Class I through Class XII + Combined Class XI & XII)
- **Unique Book Codes**: **1,066**
- **Duplicate Upstream Code Mapping**:
  - Code `gsikr1` (Class VII Arts) is mapped to two distinct titles:
    1. *Kriti-I (Sindhi)*
    2. *Kriti-I (Telugu)*
  - Handled by grouping records by unique `book_code`. The archive is downloaded only once while preserving all titles in the manifest.
- **Official Complete-Book ZIP URL Format**: `https://ncert.nic.in/textbook/pdf/{code}dd.zip`

### Class-Wise Record Distribution

| Class | Verified Books | Notes |
| :--- | :--- | :--- |
| **Class I** | 26 | Includes NEP-2020 *Mridang*, *Joyful-Mathematics* translations |
| **Class II** | 26 | Includes NEP-2020 *Joyful-Mathematics* translations |
| **Class III** | 95 | Multilingual translations across Santali, Urdu, etc. |
| **Class IV** | 94 | Complete primary school curriculum |
| **Class V** | 93 | Multilingual environmental and mathematics editions |
| **Class VI** | 140 | Middle school foundational textbooks |
| **Class VII** | 184 | Includes dual-mapped `gsikr1` in Arts |
| **Class VIII** | 164 | NEP-2020 *Malhar* (old *Vasant* ladder excluded) |
| **Class IX** | 16 | 1 failure logged for ICT Coming Soon |
| **Class X** | 34 | Complete secondary school curriculum |
| **Class XI** | 91 | Higher secondary core & elective streams |
| **Class XII** | 99 | Higher secondary core & elective streams |
| **Class XI & XII Combined** | 5 | Combined vocational and supplementary textbooks |
| **Total** | **1,067** | |

---

## 6. Automated Testing & Verification Results

A comprehensive suite of **25 automated tests** was executed via `python -m unittest discover -s scraper/tests -v`.

### Real Test Execution Output
```
test_download_mocked_404_not_found (test_download_books.TestArchiveValidationAndRecovery) ... ok
test_download_mocked_success (test_download_books.TestArchiveValidationAndRecovery) ... ok
test_sha256_computation (test_download_books.TestArchiveValidationAndRecovery) ... ok
test_verify_zip_archive_corrupted_crc (test_download_books.TestArchiveValidationAndRecovery) ... ok
test_verify_zip_archive_corrupted_non_zip (test_download_books.TestArchiveValidationAndRecovery) ... ok
test_verify_zip_archive_missing_pdf (test_download_books.TestArchiveValidationAndRecovery) ... ok
test_verify_zip_archive_valid (test_download_books.TestArchiveValidationAndRecovery) ... ok
test_catalogue_counts (test_download_books.TestCatalogueIntegrity) ... ok
test_complete_book_zip_urls (test_download_books.TestCatalogueIntegrity) ... ok
test_dual_mapping_gsikr1 (test_download_books.TestCatalogueIntegrity) ... ok
test_deduplication_grouping (test_download_books.TestDownloaderDeduplicationAndManifest) ... ok
test_dry_run_execution (test_download_books.TestDownloaderDeduplicationAndManifest) ... ok
test_end_to_end_run_with_checkpoint (test_integration.TestNcertScraperIntegration) ... ok
test_live_cdn_404_on_invalid_code (test_integration.TestNcertScraperIntegration) ... ok
test_live_cdn_resource_probe (test_integration.TestNcertScraperIntegration) ... ok
test_atomic_write_json (test_ncert_scraper.TestNcertScraper) ... ok
test_book_code_regex_validation (test_ncert_scraper.TestNcertScraper) ... ok
test_change_valid_subjects (test_ncert_scraper.TestNcertScraper) ... ok
test_class_mapping_extraction (test_ncert_scraper.TestNcertScraper) ... ok
test_comment_stripping (test_ncert_scraper.TestNcertScraper) ... ok
test_dual_mapping_edge_case_gsikr1 (test_ncert_scraper.TestNcertScraper) ... ok
test_full_catalogue_counts_and_convergence (test_ncert_scraper.TestNcertScraper) ... ok
test_no_commented_out_books_leaked (test_ncert_scraper.TestNcertScraper) ... ok
test_no_dead_old_syllabus_blocks_leaked (test_ncert_scraper.TestNcertScraper) ... ok
test_whitespace_normalization (test_ncert_scraper.TestNcertScraper) ... ok

----------------------------------------------------------------------
Ran 25 tests in 1.408s

OK (25 passed, 0 failed, 0 errors)
```

### Controlled Live Download & Retry Verification
- Executed a controlled test for a single book (`aemr1` - Class I English *Mridang*):
  - **Attempt 1**: Network connection reset simulated by server (`WinError 10054`).
  - **Attempt 2**: Exponential backoff retry engaged after 1.71s, stream completed successfully.
  - **Validation**: `verify_zip_archive()` confirmed all 10 member entries and CRC integrity.
  - **Digest**: SHA-256 `adbf700f81548e5222baddd7e4d2c3882e1b415563ddb0d49e9c0df858cd3e76`.
  - **Re-run Cache Verification**: Re-running the command completed in 0.18s, detecting `Already Cached/Valid: 1` without downloading.
  - **Cleanup**: Temporary test files cleanly removed.

---

## 7. Command Reference

### Scraper Discovery (`scraper.py`)
```bash
# Offline deterministic parse using authoritative HTML fixture
python scraper/scraper.py --fixture scraper/tests/fixtures/textbook.php.html

# Live portal scrape with CDN validation sample
python scraper/scraper.py --validate-cdn --cdn-sample-size 15
```

### Complete-Book ZIP Downloader (`download_books.py`)
```bash
# Dry run: view planned downloads without network traffic
python scraper/download_books.py --class 10 --dry-run

# Targeted subject download
python scraper/download_books.py --class 10 --subject Mathematics --dry-run

# Targeted book codes with bounded concurrency
python scraper/download_books.py --books aemr1,jemh1 --out downloads --concurrency 2
```

### Unified Pipeline (`main.py`)
```bash
# Preview Class 10 downloads
python scraper/main.py --class 10 --dry-run

# Verify blocked legacy flag (exits code 1)
python scraper/main.py --upload-to-ia

# Download Class 10 books with manifest output
python scraper/main.py --class 10 --out downloads --manifest download_manifest.json
```

---

## 8. Remaining Blockers & Next Actions

- **Blockers**: None. The migration is complete, verified, and operational.
- **Manual Actions Required**: None. All automated IA supervisors and workers have been halted and disabled. The system is ready for routine NCERT catalogue and complete-book ZIP operations.
