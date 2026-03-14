#!/bin/bash
set -e
/usr/local/bin/python3 /app/getData.py
/usr/local/bin/python3 /app/import_csv.py