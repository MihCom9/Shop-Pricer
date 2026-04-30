import csv
import os
import sys
import psycopg2
import re
from dotenv import load_dotenv
from pathlib import Path
from psycopg2.extras import execute_values
sys.stdout.reconfigure(line_buffering=True)

env_path = Path('/app/.env')
load_dotenv(dotenv_path=env_path)

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USERNAME"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "sslmode": "require",
    "connect_timeout": 10  # <-- add this
}

TABLE = "product_insert"
CSV_COLUMNS = ["city", "store", "product_name", "code", "category", "price", "price_promotion"]
DB_COLUMNS = ["measurements","city_id", "store_id", "product_id", "category_id", "price", "price_promotion"]

CSV_DIR = "/storesData/stores"
BATCH_SIZE = 20000

def detect_delimiter(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        header = f.readline()
    for delim in [',', ';', '\t']:
        reader = csv.reader([header], delimiter=delim, quotechar='"')
        try:
            cols = next(reader)
            if len(cols) == len(CSV_COLUMNS):
                return delim
        except StopIteration:
            continue
    best_delim, best_diff = ',', float('inf')
    for delim in [',', ';', '\t']:
        reader = csv.reader([header], delimiter=delim, quotechar='"')
        try:
            cols = next(reader)
            diff = abs(len(cols) - len(CSV_COLUMNS))
            if diff < best_diff:
                best_diff, best_delim = diff, delim
        except StopIteration:
            continue
    return best_delim

def build_lookup_cache(conn):
    print("  Building lookup cache...")
    with conn.cursor() as cur:
        cur.execute("SELECT ekatte, id FROM cities")
        cities = {row[0]: row[1] for row in cur.fetchall()}
        print(f"  Loaded {len(cities)} cities")

        cur.execute("SELECT name, id FROM stores")
        stores = {row[0]: row[1] for row in cur.fetchall()}
        print(f"  Loaded {len(stores)} stores")

        cur.execute("SELECT store_id, location, id FROM store_locations")
        store_locations = {}
        for store_id, location, loc_id in cur.fetchall():
            store_locations.setdefault(store_id, {})[location] = loc_id
        print(f"  Loaded {sum(len(v) for v in store_locations.values())} store locations")

        cur.execute("SELECT cid, id FROM categories")
        categories = {row[0]: row[1] for row in cur.fetchall()}
        print(f"  Loaded {len(categories)} categories")

        cur.execute("SELECT name, id FROM products")
        products = {row[0]: row[1] for row in cur.fetchall()}
        print(f"  Loaded {len(products)} products")

    return cities, stores, store_locations, categories, products

def process_product_name(raw: str):
    """Returns (cleaned_name, measurements)"""
    if not raw:
        return raw, ''
    
    units = r'(МЛ|ML|Л|L|ГР|Г|G|KG|КГ|БР|мл|ml|л|гр|г|кг|kg|бр|pcs|cl|oz)'
    percent = r'\d+(?:[.,]\d+)?\s*%'
    
    measurements = []

    # Extract all percentage values e.g. "3.6%"
    for m in re.finditer(percent, raw):
        measurements.append(m.group().strip())

    # Extract ratio pattern e.g. "500гр/100мл"
    for m in re.finditer(rf'\d+[.,]?\d*\s*{units}\.?\s*/\s*\d+[.,]?\d*\s*{units}\.?', raw, re.IGNORECASE):
        measurements.append(m.group().strip())

    # Extract simple unit matches e.g. "500мл", "1кг"
    # Only run if no ratio was found to avoid double-capturing
    if not any('/' in m for m in measurements):
        for m in re.finditer(rf'\d+[.,]?\d*\s*{units}\.?', raw, re.IGNORECASE):
            measurements.append(m.group().strip())

    measurement_str = ' '.join(dict.fromkeys(measurements))  # deduplicated, order preserved

    # Clean the name
    result = raw
    result = re.sub(r'^[\s,\-~]+', '', result)
    result = re.sub(rf'\s*\d+[.,]?\d*\s*{units}\.?\s*/\s*\d+[.,]?\d*\s*{units}\.?', '', result, flags=re.IGNORECASE)
    result = re.sub(rf'\s*\d+[.,]?\d*\s*{units}\.?', '', result, flags=re.IGNORECASE)
    result = re.sub(r'\s*\d+(?:[.,]\d+)?\s*%\s*', ' ', result)
    result = re.sub(r'[\s,&%/\-\.]+$', '', result)
    result = re.sub(r'\s{2,}', ' ', result)

    return result.strip(), measurement_str

def getCityid(cur, cities, city_code):
    if city_code in cities:
        return cities[city_code]
    
    cur.execute(
        "INSERT INTO cities (ekatte) VALUES (%s) RETURNING id",
        (city_code,)
    )
    new_id = cur.fetchone()[0]
    cities[city_code] = new_id
    print(f"  [INSERTED] New city '{city_code}' -> id {new_id}")
    return new_id

def getCategoryId(categories, categoryCode):
    if not categoryCode or not categoryCode.isdigit():
        print(f"  [SKIP] Invalid category code: {categoryCode!r}")
        return None
    code = int(categoryCode)
    result = categories.get(code)
    if result is None:
        print(f"  [NOT FOUND] Category code {code} not in cache. Sample keys: {list(categories.keys())[:5]}")
    return result

def store_available(cur, store_name, stores):
    if store_name in stores:
        return stores[store_name]
    cur.execute(
        "INSERT INTO stores (name) VALUES (%s) RETURNING id",
        (store_name,)
    )
    new_id = cur.fetchone()[0]
    stores[store_name] = new_id
    print(f"  [INSERTED] New store '{store_name}' -> id {new_id}")
    return new_id

def store_location_available(cur, store_id, location, store_locations):
    if location in store_locations.get(store_id, {}):
        return store_locations.get(store_id, {}).get(location)
    cur.execute(
        "INSERT INTO store_locations (store_id, location) VALUES (%s, %s) RETURNING id",
        (store_id, location)
    )
    new_id = cur.fetchone()[0]
    store_locations.setdefault(store_id, {})[location] = new_id
    print(f"  [INSERTED] New store location '{location}' for store_id {store_id} -> id {new_id}")
    return new_id

def getProductId(cur, products, productName, code):
    if not productName:
        return None
    if productName in products:
        return products[productName]
    
    cur.execute(
        "INSERT INTO products (code, name) VALUES (%s, %s) RETURNING id",
        ( code, productName)
    )
    new_id = cur.fetchone()[0]
    products[productName] = new_id  # update cache
    print(f"  [INSERTED] New product '{productName}' -> id {new_id}")
    return new_id

def import_csv(conn, filepath, fname, cities, stores, store_locations, categories, products):
    delim = detect_delimiter(filepath)

    store_name = re.sub(r'[(_].*$', '', fname.replace('.csv', '')).strip()
    if store_name.lower() == "avon":
        store_name = "Билла"
    print(f"  Store location key: '{store_name}'")
    print(f"  Detected delimiter: {delim!r}")

    skipped = 0
    rows_inserted = 0
    rows_processed = 0
    not_found_products = 0
    batch = []
    query = f"INSERT INTO {TABLE} ({','.join(DB_COLUMNS)}) VALUES %s"

    with conn.cursor() as cur:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter=delim, quotechar='"', skipinitialspace=True)
            header = next(reader)
            print(f"  CSV headers ({len(header)} cols): {header}")

            # Peek at first 2 data rows for diagnosis
            peek_rows = []
            for _ in range(2):
                try:
                    peek_rows.append(next(reader))
                except StopIteration:
                    break
            if peek_rows:
                print(f"  Sample row 1: {peek_rows[0]}")
            if len(peek_rows) > 1:
                print(f"  Sample row 2: {peek_rows[1]}")

            # Rewind and skip header again to process from the top
            f.seek(0)
            reader = csv.reader(f, delimiter=delim, quotechar='"', skipinitialspace=True)
            next(reader)  # skip header

            for i, row in enumerate(reader, start=2):
                row = [field.strip() for field in row]
                if len(row) != len(CSV_COLUMNS):
                    print(f"  [MALFORMED] Line {i}: expected {len(CSV_COLUMNS)} cols, got {len(row)}: {row}")
                    skipped += 1
                    continue

                city_str, store_str, product_name, code, category_str, price, price_promotion = row

                product_name, measurements = process_product_name(product_name)
                city_id     = getCityid(cur, cities, city_str)
                category_id = getCategoryId(categories, category_str)
                store_id    = store_available(cur, store_name, stores)
                location_id = store_location_available(cur, store_id, store_str, store_locations)
                product_id  = getProductId(cur, products , product_name, code)

                if product_id is None:
                    not_found_products += 1
                    skipped += 1
                    continue

                if city_id is None or store_id is None or location_id is None:
                    skipped += 1
                    continue

                batch.append((measurements,city_id, location_id, product_id, category_id, price or None, price_promotion or None))
                rows_processed += 1

                if len(batch) >= BATCH_SIZE:
                    execute_values(cur, query, batch, page_size=BATCH_SIZE)
                    rows_inserted += len(batch)
                    print(f"  Flushed batch — total inserted so far: {rows_inserted}")
                    batch.clear()

        if batch:
            execute_values(cur, query, batch, page_size=BATCH_SIZE)
            rows_inserted += len(batch)

    print(f"  Done: {rows_inserted} inserted, {skipped} skipped ({not_found_products} due to missing product_id)")

def main():
    csv_files = [f for f in os.listdir(CSV_DIR) if f.endswith('.csv')]
    if not csv_files:
        print("No CSV files found.")
        sys.exit(1)

    print(f"Attempting to connect to Supabase at {DB_CONFIG['host']}...")

    try:
        conn = psycopg2.connect(**DB_CONFIG)

        db_params = conn.get_dsn_parameters()
        print(f"Successfully connected to database: {db_params.get('dbname')}")
        print(f"PostgreSQL version: {conn.get_parameter_status('server_version')}")

        # Sanity-check products table before doing anything
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM products")
            product_count = cur.fetchone()[0]
            print(f"Products table has {product_count} rows")
            if product_count == 0:
                print("WARNING: products table is empty — all product lookups will fail!")
            else:
                cur.execute("SELECT id, name FROM products LIMIT 5")
                samples = cur.fetchall()
                print(f"Sample products: {samples}")

        cities, stores, store_locations, categories, products = build_lookup_cache(conn)

        with conn.cursor() as cur:
            print(f"Preparing table {TABLE}...")
            cur.execute(f"DROP TABLE IF EXISTS {TABLE}")
            cur.execute(f"CREATE TABLE {TABLE} (LIKE product_test INCLUDING ALL)")
            cur.execute(f"ALTER TABLE {TABLE} ADD CONSTRAINT fk_city     FOREIGN KEY (city_id)     REFERENCES cities(id)")
            cur.execute(f"ALTER TABLE {TABLE} ADD CONSTRAINT fk_store    FOREIGN KEY (store_id)    REFERENCES store_locations(id)")  # ← changed
            cur.execute(f"ALTER TABLE {TABLE} ADD CONSTRAINT fk_product  FOREIGN KEY (product_id)  REFERENCES products(id)")
            cur.execute(f"ALTER TABLE {TABLE} ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id)")
            # cur.execute(f"CREATE TABLE IF NOT EXISTS products_insert (LIKE products INCLUDING ALL)")
        conn.commit()

        num, errors = 0, 0
        for fname in sorted(csv_files):
            filepath = os.path.join(CSV_DIR, fname)
            print(f"\n--- Importing {fname} ---")
            try:
                import_csv(conn, filepath, fname, cities, stores, store_locations, categories, products)
                conn.commit()
                num += 1
            except Exception as e:
                conn.rollback()
                print(f"  FAILED: {e}")
                errors += 1

        print(f"\nAll done. {num} file(s) imported, {errors} failed.")

        if errors == 0:
            with conn.cursor() as cur:
                print("\nSwapping tables...")
                cur.execute("ALTER TABLE product_test RENAME TO product_old")
                cur.execute("ALTER TABLE product_insert RENAME TO product_test")
                conn.commit()  # commit the renames first
                
                cur.execute("REFRESH MATERIALIZED VIEW product_grouped")
                conn.commit()  # commit the refresh
                
                cur.execute("DROP TABLE product_old")
                conn.commit()  # commit the drop
            conn.commit()
            print("Done: product_insert renamed to product_test.")
        else:
            print("Skipping table swap due to import errors.")

    except psycopg2.OperationalError as e:
        print(f"ERROR: Could not connect to Supabase.")
        print(f"Details: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    main()