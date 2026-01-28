# QR360: High-Performance Dynamic QR Proxy System

QR360 is a professional-grade, full-stack application designed to manage and track dynamic QR code campaigns. Unlike static QR codes, QR360 uses a **Proxy Architecture**, allowing you to update the destination of your QR codes in real-time without ever needing to reprint the physical code.

## 🎯 Project Objective
The core objective of QR360 is to provide businesses and individuals with a "Forever QR"—a single physical asset that can evolve with their marketing needs. By decoupling the physical QR code from its digital destination, QR360 ensures that your printed materials never become obsolete.

## 🚀 Key Features

### 1. Dynamic Redirection
Update the target URL of any QR code instantly through the dashboard. The change is immediate across all existing physical scans.

### 2. High-Resolution Branding
- **Logo Embedding**: Upload your brand logo to be perfectly centered in the QR code.
- **Executive Export**: Download 1024x1024 high-resolution PNG images optimized for professional printing on flyers, billboards, or business cards.

### 3. Advanced vCard Support
Generate digital contact cards that allow users to save your name, phone, email, and organization directly to their phone's contacts with a single scan.

### 4. Source Attribution & Tracking
The unique **Source Tag** system allows you to track exactly where your traffic is coming from (e.g., "Instagram-Bio" vs. "Print-Flyer") without creating multiple destination URLs.

### 5. Live Analytics Dashboard
Monitor campaign performance with real-time scan metrics, including total clicks and active vs. paused status tracking.

## 🛠 Technical Architecture
QR360 is built with a modern, high-performance stack:
- **Backend**: FastAPI (Python) - High performance, asynchronous API.
- **Frontend**: React + Vite + Tailwind CSS - Smooth, responsive, and aesthetic UI.
- **Database**: MongoDB - Flexible document storage for QR configurations and logs.
- **Automation**: Docker Compose - Orchestrated containerization for one-command deployment.

---

## 💻 Getting Started

Ensure **Docker Desktop** is installed and running, then run from the project root:
```bash
docker-compose up --build -d
```
The application will be available at:
- **Dashboard (UI)**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:8001](http://localhost:8001)

---

## 🔐 Default Credentials
- **Username**: `admin`
- **Password**: `password`
*(Change these in the "Security" tab under Settings after your first login)*
