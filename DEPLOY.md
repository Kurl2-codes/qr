# Deployment Guide: QR360 System

Follow these steps to deploy a copy of the QR360 application on a new device.

## Prerequisites

Ensure the following are installed on the new machine:
1.  **Python 3.10+**: [Download](https://www.python.org/downloads/)
2.  **Node.js 18+**: [Download](https://nodejs.org/)
3.  **MongoDB Community Server**: [Download](https://www.mongodb.com/try/download/community)
4.  **MongoDB Database Tools** (for restore): [Download](https://www.mongodb.com/try/download/database-tools)

---

## Step 1: Clone the Repository

Copy the entire project folder to the new machine.

```bash
git clone <your-repo-url> QR360
cd QR360
```

## Step 2: Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure Environment Variables:
    - Create a `.env` file in the `backend/` folder.
    - Copy the contents from your existing `.env` or use this template:
    ```env
    PROXY_BASE_URL=http://localhost:8001/q/
    MONGODB_URL=mongodb://localhost:27017
    SECRET_KEY=your-secure-secret-key
    DATABASE_NAME=qr360
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    UPLOAD_DIR=uploads
    ```

5.  Run the server:
    ```bash
    python -m app.main
    ```

## Step 3: Database Restoration

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
