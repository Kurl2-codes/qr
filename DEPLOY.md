# Deployment Guide: QR360 System

Follow these steps to deploy a copy of the QR360 application on a new device.

## Prerequisites

Ensure the following are installed on the new machine:
1.  **Python 3.10+**: [Download](https://www.python.org/downloads/)
2.  **Node.js 18+**: [Download](https://nodejs.org/)
3.  **Docker Desktop**: [Download](https://www.docker.com/products/docker-desktop/) (Preferred for Database)
4.  **MongoDB Community Server**: (Optional, only if not using Docker)
5.  **MongoDB Database Tools**: [Download](https://www.mongodb.com/try/download/database-tools)

---

## Step 1: Clone the Repository

Copy the entire project folder to the new machine.

```bash
git clone <your-repo-url> QR360
cd QR360
```

## Step 2: Database & Backend Setup (Containerized)

Using Docker is the easiest way to run the system. It automates the database setup and ensures the backend is correctly configured to talk to it.

1.  Make sure Docker Desktop is running.
2.  In the project root directory, start the services:
    ```bash
    docker-compose up --build -d
    ```
    This will build the backend image and start both MongoDB and the FastAPI server in the background.

The API will be available at [http://localhost:8001](http://localhost:8001).

## Step 4: Database Restoration (Optional)

To restore your data (`qr360` database) from the old machine:

1.  **On the Old Machine**:
    Run the dump script to create a backup.
    ```bash
    python backend/scripts/dump_db.py
    ```
    This will create a folder like `db_dumps/dump_2024...`.

2.  **Transfer Data**:
    Copy the `db_dumps` folder to the new machine.

3.  **On the New Machine**:
    Run the restore command (replace the timestamp with yours):
    ```bash
    mongorestore --db qr360 db_dumps/dump_2024.../qr360
    ```

## Step 4: Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    - Create a `.env` file in the `frontend/` folder.
    ```env
    VITE_API_BASE_URL=http://localhost:8001/api
    VITE_UPLOAD_BASE_URL=http://localhost:8001/uploads
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

## Step 5: Verify Deployment

Access the application at `http://localhost:5173`.
Log in with your existing credentials.
Check the "Analytics" page to confirm your data has been restored.
