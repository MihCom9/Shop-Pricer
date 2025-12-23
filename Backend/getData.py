import requests
from datetime import datetime, timedelta
import zipfile
import io
import time
import os
import shutil

DATA_DIR = "./storesData/stores"
BACKUP_DIR = "./storesData/backup"
BASE_URL = "https://www.kolkostruva.bg/opendata_files/"
RETRY_INTERVAL = 1800        # 30 minutes
MAX_RETRIES = 16

# Compute yesterday's date
yesterday = (datetime.today() - timedelta(days=1)).strftime("%Y-%m-%d")
file_url = f"{BASE_URL}{yesterday}.zip"
def saveOldContent(backup_dir, save_dir):
    os.makedirs(backup_dir,exist_ok=True)

    # Remove old files in backup_dir
    print("Removing old files in backup folder.")
    for filename in os.listdir(backup_dir):
        file_path = os.path.join(backup_dir, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)

    # Backup the new files
    if os.path.exists(save_dir):
        print("Saving the files from the save folder into the backup:")
        for filename in os.listdir(save_dir):
            src_file = os.path.join(save_dir, filename)
            dst_file = os.path.join(backup_dir, filename)
            
            if os.path.isfile(src_file):
                print(f"Savinf file {src_file} into file {dst_file}")
                shutil.copy2(src_file, dst_file)
    else:
        print("Making a new folder to save the files in.")
        os.makedirs(save_dir, exist_ok=True)
    

def download_file(url, save_dir, backup_dir):
    print(f"Trying to download: {url}")
    r = requests.get(url)
    if r.status_code == 200:
        saveOldContent(backup_dir, save_dir)
        z = zipfile.ZipFile(io.BytesIO(r.content))
        z.extractall(save_dir)
        print(f"Downloaded and extracted to {save_dir}")
        return True
    else:
        print(f"File not found, status code {r.status_code}")
        return False

# Retry loop
retries = 0
while retries < MAX_RETRIES:
    if download_file(file_url, DATA_DIR, BACKUP_DIR):
        break
    retries += 1
    print(f"Retrying in {RETRY_INTERVAL // 60} minutes...")
    time.sleep(RETRY_INTERVAL)

if retries == MAX_RETRIES:
    print("Failed to download the file after multiple attempts.")
