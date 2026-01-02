#!/bin/bash
set -e
/usr/local/bin/python3 /app/getData.py
/app/importCSV.sh