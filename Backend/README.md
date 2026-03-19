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

### 📊 Database Size Requirement

The database used in this project is approximately **0.65 GB** in size.

Make sure that the database system you use (local Docker instance or cloud provider) can comfortably handle this amount of data. It is recommended to:

* Allocate sufficient disk space
* Ensure adequate memory for database performance
* Avoid using free-tier plans with strict storage limits

---

## 🚀 Getting Started

### 1. Start Docker Containers

Run the following command in the root of the project:

```bash
docker-compose up --build
```

This will start:

* Backend container
* Database container
* Data collector (scheduler) container

---

## ⏳ Wait for Data Extraction

After starting the containers, wait approximately **10 minutes** for the data extraction script to run automatically.

### ⏱ Optional: Modify Execution Time

If you want to change how often the script runs:

1. Navigate to:

```
collectorDataContainer/Scheduler/
```

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
3. Ensure database can handle ~0.65 GB of data
4. Run `docker-compose up --build`
5. Wait ~10 minutes (or adjust cron schedule)
6. Start frontend
7. App is ready to use 🎉

---
