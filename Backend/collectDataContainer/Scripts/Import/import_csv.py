#!/usr/bin/env python3
import csv
import os
import sys
import psycopg2
from psycopg2.extras import execute_values

DB_CONFIG = {
    "dbname": "mydatabase",
    "user": "postgres",
    "password": "yourpassword",
    "host": "database"
}

TABLE = "product"
COLUMNS = ["city", "store", "product_name", "code", "category", "price", "price_promotion"]
CSV_DIR = "/storesData/stores"
BATCH_SIZE = 500  # Number of rows to insert in a single query

def detect_delimiter(filepath):
    """Detect delimiter by trying to parse header and checking column count."""
    with open(filepath, 'r', encoding='utf-8') as f:
        header = f.readline()
    
    for delim in [',', ';', '\t']:
        reader = csv.reader([header], delimiter=delim, quotechar='"')
        try:
            cols = next(reader)
            if len(cols) == len(COLUMNS):
                return delim
        except StopIteration:
            continue
    
    # Fallback: pick whichever gives closest column count
    best_delim, best_diff = ',', float('inf')
    for delim in [',', ';', '\t']:
        reader = csv.reader([header], delimiter=delim, quotechar='"')
        try:
            cols = next(reader)
            diff = abs(len(cols) - len(COLUMNS))
            if diff < best_diff:
                best_diff, best_delim = diff, delim
        except StopIteration:
            continue
            
    return best_delim

def import_csv(conn, filepath):
    delim = detect_delimiter(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=delim, quotechar='"', skipinitialspace=True)
        next(reader)  # skip header
        
        skipped = 0
        rows_inserted = 0
        batch = []

        # Prepare the base query for execute_values
        query = f"INSERT INTO {TABLE} ({','.join(COLUMNS)}) VALUES %s"

        with conn.cursor() as cur:
            for i, row in enumerate(reader, start=2):
                # Strip surrounding whitespace from each field
                row = [field.strip() for field in row]
                
                if len(row) != len(COLUMNS):
                    print(f"  Line {i}: skipping malformed row ({len(row)} cols): {row}")
                    skipped += 1
                    continue

                batch.append(row)

                # Insert when batch size is reached to manage memory
                if len(batch) >= BATCH_SIZE:
                    execute_values(cur, query, batch, page_size=BATCH_SIZE)
                    rows_inserted += len(batch)
                    batch.clear()  # Empty the list for the next batch

            # Insert any remaining rows in the final batch
            if batch:
                execute_values(cur, query, batch, page_size=BATCH_SIZE)
                rows_inserted += len(batch)

    print(f"  Inserted {rows_inserted} rows" + (f", skipped {skipped} malformed" if skipped else ""))

def main():
    csv_files = [f for f in os.listdir(CSV_DIR) if f.endswith('.csv')]
    if not csv_files:
        print("No CSV files found.")
        sys.exit(1)

    conn = psycopg2.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cur:
            cur.execute(f"TRUNCATE TABLE {TABLE}")
        conn.commit()

        num, errors = 0, 0
        for fname in sorted(csv_files):
            filepath = os.path.join(CSV_DIR, fname)
            print(f"Importing {filepath}")
            try:
                import_csv(conn, filepath)
                conn.commit()
                num += 1
            except Exception as e:
                conn.rollback()
                print(f"  FAILED: {e}")
                errors += 1

        print(f"\nDone. {num} imported, {errors} failed.")
    finally:
        conn.close()

if __name__ == '__main__':
    main()