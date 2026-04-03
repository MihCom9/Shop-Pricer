#!/bin/bash
set -e
/usr/local/bin/python3 /app/getData.py

echo "Starting database import..." >> /logs/cron.log
/usr/local/bin/python3 -u /app/import_csv.py

echo "Cron job finished." >> /logs/cron.log