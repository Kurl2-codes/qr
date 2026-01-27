# QR Code Project

## How to Run

### Prerequisites
- Python 3.x
- Node.js
- MongoDB (running on localhost:27017)

### 1. Database
Ensure MongoDB is running.
If you have Docker Desktop installed:
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
# Install dependencies (first time only)
.\venv\Scripts\pip install -r requirements.txt

# Run server
.\venv\Scripts\python main.py
```
The API will be available at [http://localhost:8001](http://localhost:8001).

### 3. Frontend
```bash
cd frontend
# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).
