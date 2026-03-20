"""
sync_data.py
============
Full data-pipeline script, run every 24 h via GitHub Actions.

Steps
-----
1. Download latest open-data ZIP from kolkostruva.bg
2. Import all CSV files into product_test (truncate first)
3. Deduplicate (same code + city + price + price_promotion → keep one row)
4. Clean product names + extract measurements  (batch UPDATE)
5. Extract brand names                          (batch UPDATE)

Environment variables (from .env or GitHub Actions secrets)
-----------------------------------------------------------
SPRING_DATASOURCE_URL      jdbc:postgresql://<host>:5432/postgres
SPRING_DATASOURCE_USERNAME postgres
SPRING_DATASOURCE_PASSWORD <password>
"""

import csv
import io
import os
import shutil
import sys
import zipfile
from datetime import datetime, timedelta

import psycopg2
import requests
from dotenv import load_dotenv
from psycopg2.extras import execute_values

# ── Configuration ─────────────────────────────────────────────────────────────

load_dotenv()

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR   = os.path.join(BASE_DIR, "data", "stores")
BACKUP_DIR = os.path.join(BASE_DIR, "data", "backup")
BASE_URL   = "https://www.kolkostruva.bg/opendata_files/"

TABLE   = "product_test"
COLUMNS = ["city", "store", "product_name", "code", "category", "price", "price_promotion"]

IMPORT_BATCH = 10_000   # rows per CSV insert batch
DEDUP_BATCH  = 50_000   # rows per dedup DELETE pass
CLEAN_BATCH  = 200_000  # rows per name-cleaning UPDATE batch
BRAND_BATCH  = 300_000  # rows per brand-extraction UPDATE batch


# ── Step 1 : Download & extract ───────────────────────────────────────────────

def _download_and_extract(url: str) -> bool:
    print(f"  Trying: {url}")
    try:
        r = requests.get(url, timeout=60)
        if r.status_code != 200:
            print(f"  HTTP {r.status_code} – skipping.")
            return False

        # Back up previous data
        if os.path.exists(DATA_DIR):
            print("  Backing up previous data…")
            if os.path.exists(BACKUP_DIR):
                shutil.rmtree(BACKUP_DIR)
            shutil.move(DATA_DIR, BACKUP_DIR)

        os.makedirs(DATA_DIR, exist_ok=True)
        z = zipfile.ZipFile(io.BytesIO(r.content))
        z.extractall(DATA_DIR)
        print(f"  Extracted to {DATA_DIR}")
        return True
    except Exception as exc:
        print(f"  Download error: {exc}")
        return False


def download_latest() -> None:
    print("[1/5] Downloading latest data…")
    today     = datetime.today().strftime("%Y-%m-%d")
    yesterday = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")

    if _download_and_extract(f"{BASE_URL}{today}.zip"):
        return
    print("  Today's file not ready yet – trying yesterday…")
    if not _download_and_extract(f"{BASE_URL}{yesterday}.zip"):
        raise RuntimeError("Could not download data for today or yesterday.")


# ── Step 2 : Import CSVs ──────────────────────────────────────────────────────

def _import_csv(conn, filepath: str) -> None:
    with open(filepath, "r", encoding="utf-8-sig") as f:
        header = f.readline()
        delim  = ";" if ";" in header else ","

    with open(filepath, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f, delimiter=delim, quotechar='"')
        next(reader)  # skip header row

        batch = []
        query = f"INSERT INTO {TABLE} ({','.join(COLUMNS)}) VALUES %s"
        with conn.cursor() as cur:
            for row in reader:
                if len(row) >= len(COLUMNS):
                    batch.append([field.strip() for field in row[:len(COLUMNS)]])
                if len(batch) >= IMPORT_BATCH:
                    execute_values(cur, query, batch)
                    batch = []
            if batch:
                execute_values(cur, query, batch)


def import_all_csvs(conn) -> None:
    print("[2/5] Importing CSV files…")

    if not os.path.exists(DATA_DIR):
        raise RuntimeError(f"Data directory not found: {DATA_DIR}")

    csv_files = sorted(f for f in os.listdir(DATA_DIR) if f.endswith(".csv"))
    if not csv_files:
        raise RuntimeError("No CSV files found after download.")

    print(f"  Found {len(csv_files)} file(s). Truncating {TABLE}…")
    with conn.cursor() as cur:
        cur.execute(f"TRUNCATE TABLE {TABLE}")
    conn.commit()

    for i, fname in enumerate(csv_files, 1):
        print(f"  [{i}/{len(csv_files)}] {fname}")
        try:
            _import_csv(conn, os.path.join(DATA_DIR, fname))
            conn.commit()
        except Exception as exc:
            print(f"    Error: {exc}")
            conn.rollback()

    with conn.cursor() as cur:
        cur.execute(f"SELECT COUNT(*) FROM {TABLE}")
        total = cur.fetchone()[0]
    print(f"  Import done – {total:,} rows in {TABLE}.")


# ── Step 3 : Deduplicate ──────────────────────────────────────────────────────

def run_dedup(conn) -> None:
    print("[3/5] Deduplicating rows…")

    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM product_test")
        before = cur.fetchone()[0]

    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS _dedup_keep")
        cur.execute("""
            CREATE TABLE _dedup_keep AS
            SELECT MIN(id) AS keep_id
            FROM product_test
            GROUP BY code, city, price, price_promotion
        """)
        cur.execute("CREATE INDEX idx_dedup_keep ON _dedup_keep(keep_id)")
    conn.commit()

    total_deleted = 0
    pass_num      = 0
    while True:
        pass_num += 1
        with conn.cursor() as cur:
            cur.execute(f"""
                DELETE FROM product_test
                WHERE id IN (
                    SELECT p.id
                    FROM product_test p
                    LEFT JOIN _dedup_keep k ON k.keep_id = p.id
                    WHERE k.keep_id IS NULL
                    LIMIT {DEDUP_BATCH}
                )
            """)
            deleted = cur.rowcount
        conn.commit()
        total_deleted += deleted
        print(f"  Pass {pass_num}: deleted {deleted:,} duplicate rows (running total {total_deleted:,})")
        if deleted == 0:
            break

    with conn.cursor() as cur:
        cur.execute("DROP TABLE IF EXISTS _dedup_keep")
    conn.commit()

    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM product_test")
        after = cur.fetchone()[0]

    print(f"  Dedup done – {before:,} → {after:,} rows ({total_deleted:,} removed).")


# ── Step 4 : Clean product names + extract measurements ───────────────────────

def run_cleaning(conn) -> None:
    print("[4/5] Cleaning product names & extracting measurements…")

    with conn.cursor() as cur:
        cur.execute("SELECT MIN(id), MAX(id) FROM product_test")
        min_id, max_id = cur.fetchone()

    if min_id is None:
        print("  Table is empty – skipping.")
        return

    cur_id    = min_id
    batch_num = 0
    total_upd = 0
    while cur_id <= max_id:
        batch_num += 1
        end_id = cur_id + CLEAN_BATCH - 1
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE product_test
                SET
                    measurements = CASE
                        WHEN measurements IS NULL OR measurements = ''
                        THEN extract_measurement(product_name)
                        ELSE measurements
                    END,
                    product_name = clean_product_name(product_name)
                WHERE id BETWEEN %s AND %s
                  AND product_name IS NOT NULL
            """, (cur_id, end_id))
            updated = cur.rowcount
        conn.commit()
        total_upd += updated
        print(f"  Batch {batch_num}: ids {cur_id:,}–{end_id:,}  ({updated:,} rows updated)")
        cur_id += CLEAN_BATCH

    print(f"  Cleaning done – {total_upd:,} rows updated.")


# ── Step 5 : Extract brands ───────────────────────────────────────────────────

def run_brand_extraction(conn) -> None:
    print("[5/5] Extracting brand names…")

    with conn.cursor() as cur:
        cur.execute("SELECT MIN(id), MAX(id) FROM product_test")
        min_id, max_id = cur.fetchone()

    if min_id is None:
        print("  Table is empty – skipping.")
        return

    cur_id    = min_id
    batch_num = 0
    total_upd = 0
    while cur_id <= max_id:
        batch_num += 1
        end_id = cur_id + BRAND_BATCH - 1
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE product_test
                SET brand = extract_brand(product_name)
                WHERE id BETWEEN %s AND %s
                  AND product_name IS NOT NULL
            """, (cur_id, end_id))
            updated = cur.rowcount
        conn.commit()
        total_upd += updated
        print(f"  Batch {batch_num}: ids {cur_id:,}–{end_id:,}  ({updated:,} rows updated)")
        cur_id += BRAND_BATCH

    print(f"  Brand extraction done – {total_upd:,} rows updated.")


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    print("=== Shop-Picker data sync ===")
    print(f"Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Step 1 – download
    download_latest()

    # Build DB connection from JDBC-style URL (same format as Spring Boot)
    jdbc_url     = os.getenv("SPRING_DATASOURCE_URL", "")
    postgres_url = jdbc_url.replace("jdbc:postgresql://", "postgresql://")

    if not postgres_url.startswith("postgresql://"):
        raise RuntimeError(
            "SPRING_DATASOURCE_URL is not set or not a valid JDBC URL. "
            "Expected: jdbc:postgresql://<host>:5432/postgres"
        )

    print("\nConnecting to database…")
    conn = psycopg2.connect(postgres_url)
    conn.autocommit = False

    try:
        import_all_csvs(conn)    # Step 2
        run_dedup(conn)          # Step 3
        run_cleaning(conn)       # Step 4
        run_brand_extraction(conn)  # Step 5
    finally:
        conn.close()

    print(f"\nAll done at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ✓")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print(f"\nFATAL: {err}", file=sys.stderr)
        sys.exit(1)
