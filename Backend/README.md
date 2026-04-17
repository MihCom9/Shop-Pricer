# 📦 Project Setup & Run Instructions
## 🐳 Prerequisites: Install Docker
Make sure you have Docker installed on your system:
### Windows
Download Docker Desktop:
https://www.docker.com/products/docker-desktop/
### macOS
Download Docker Desktop:
https://www.docker.com/products/docker-desktop/
### Linux
Install Docker via your package manager. Example (Ubuntu):
```bash
sudo apt update
sudo apt install docker.io docker-compose
```
Start Docker:
```bash
sudo systemctl start docker
```
---
## ⚙️ Environment Configuration
Before starting the project, you need to create a `.env` file in the **root folder** of the app.
This file should contain the configuration for your database connection. Depending on your setup, this could be:
* A local database (running in Docker)
* A cloud database (e.g., Supabase)
* Any external database service
### Example `.env` file:
```env
DB_URL=your_database_url
DB_USERNAME=your_username
DB_PASSWORD=your_password
```
### Notes:
* For services like Supabase, replace the values with the provided connection details.
* Make sure the `.env` file is **not committed** to version control (add it to `.gitignore`).
---
## 🚀 Getting Started
### 1. Start the Data Collector Container
Run the following command in the root of the project:
```bash
docker-compose up --build
```
This will start:
* Data collector (scheduler) container
### 2. Start the Backend
Run the following command in the root of the project:
```bash
./gradlew bootRun
```
---
## ⏳ Wait for Data Extraction
After starting the containers, wait approximately **10 minutes** for the data extraction script to run automatically.
### ⏱ Optional: Modify Execution Time
If you want to change how often the script runs:
1. Navigate to: collectorDataContainer/Scheduler/
2. Open the `crontab` file and adjust the schedule as needed.
---
## 💻 Start the Frontend
Once the data has been extracted, start the frontend application (depending on your setup):
```bash
npm install
npm start
```
---
## ✅ Summary
1. Install Docker
2. Create `.env` file with database configuration
3. Run `docker-compose up --build` (data collector container)
4. Run `./gradlew bootRun` (backend)
5. Wait ~10 minutes (or adjust cron schedule)
6. Start frontend
7. App is ready to use 🎉
---