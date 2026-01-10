#!/bin/bash
set -euo pipefail  # stop on error, error on unset variables, fail on pipeline errors

DB="mydatabase"
USER="postgres"          
HOST="database"         
TABLE="product"
export PGPASSWORD='yourpassword'
num=0

# CSV directory (absolute path)
CSV_DIR="$(cd /storesData/stores && pwd)"

echo "Using CSV directory: $CSV_DIR"

psql -h "$HOST" -U "$USER" -d "$DB" <<EOF
BEGIN;
TRUNCATE TABLE $TABLE;
EOF

# Import all CSV files
for file in "$CSV_DIR"/*.csv; do
    set +e  # temporarily disable "exit on error"
    DELIM=","
    if head -n 1 "$file" | grep -q ';'; then
        DELIM=";"
    fi
    echo "Importing $file"
    psql -h "$HOST" -U "$USER" -d "$DB" -c "\copy $TABLE(city,store,product_name,code,category,price,price_promotion) FROM '$file' DELIMITER '$DELIM' CSV HEADER"
    ((num+=1))
done
set -e  # re-enable "exit on error"
# Commit transaction
psql -h "$HOST" -U "$USER" -d "$DB" <<EOF
COMMIT;
EOF

echo "All $num CSVs imported successfully."
