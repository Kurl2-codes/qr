# QR Code Project

## How to Run

### Prerequisites
- Python 3.x
- Node.js
- MongoDB (running on localhost:27017)

### 1. Database & Backend (Automatic)
Ensure Docker Desktop is installed and running.
Run the following command from the project root:
```bash
docker-compose up --build -d
```
This will start both the MongoDB database and the FastAPI backend automatically. The API will be available at [http://localhost:8001](http://localhost:8001).

### 3. Frontend
```bash
cd frontend
# Install dependencies (first time only)
npm install

# Run development server
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).
