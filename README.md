# Health Vault Secure 🩺  
Digital Health Wallet – 2care.ai Assignment

Health Vault Secure is a full-stack Digital Health Wallet application that allows users to securely store, manage, visualize, and share their medical reports and vitals anytime, anywhere.

---

## 🚀 Features Overview

### 👤 User Management
- User registration & login
- JWT-based authentication
- Role support (Owner / Viewer – partially implemented)

### 📄 Health Reports
- Upload medical reports (PDF / Images)
- Store metadata (report type, date, notes)
- View, download, and delete reports
- Search & filter reports by date, type, and keyword

### ❤️ Vitals Tracking
- Store vitals over time (BP, Sugar, Heart Rate, Oxygen, etc.)
- Visualize trends using charts
- Filter vitals by date range

### 🔐 Access Control & Sharing
- Share specific reports with others via email
- Read-only access for shared users
- Revoke shared access

---

## 🧱 Tech Stack

### Frontend
- ReactJS (Vite)
- Redux Toolkit
- React Router
- Tailwind CSS
- shadcn/ui
- Recharts
- Axios

### Backend
- Node.js
- Express.js
- SQLite (via sql.js)
- JWT Authentication
- Multer (file uploads)

---

## 🗂️ Project Structure

```text
health-vault-secure/
│
├── frontend/          # ReactJS frontend application
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── backend/           # Node.js + Express backend
│   ├── routes/
│   ├── database/
│   ├── middleware/
│   ├── server.js
│   └── README.md
│
└── README.md          # Root documentation (this file)

##🧠 System Architecture

Client (ReactJS)
   ↓  (Axios + JWT)
Backend Server (Node.js / Express)
   ↓
SQLite Database
   ↓
Local File Storage (Multer)

## ⚙️ Setup Instructions

## 1️⃣ Clone Repository

git clone https://github.com/Chandu-rgukt/health-vault-secure
cd health-vault-secure

## 2️⃣ Backend Setup
cd frontend
npm install
npm run dev

## 3️⃣ Frontend Setup
cd frontend
npm install
npm run dev




