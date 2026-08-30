# 🛒 Multi-Vendor E-Commerce Platform

A production-ready, full-stack multi-vendor e-commerce application featuring a Node.js REST API backend, MongoDB Atlas Cloud database integration, Redis caching, Next.js customer storefront, React admin panel, and Next.js seller dashboard.

---

## 🏗 Repository Architecture

```text
E-Commerce/
├── BACKEND/                  # Node.js / Express API Server (Port 5000)
│   ├── config/               # Database & Swagger configuration
│   ├── controllers/          # Business logic & JWT API handlers
│   ├── middleware/           # Auth & logger middlewares
│   ├── models/               # MongoDB models (Users, Products, Orders, etc.)
│   ├── routes/               # Express API routing endpoints
│   ├── Dockerfile            # Container definition for Backend
│   └── docker-compose.yml    # Standalone Compose for Backend + Redis
│
├── FRONTEND/
│   ├── WEBSITE/              # Next.js 16 Customer Storefront (Port 3002)
│   ├── ADMIN/                # React 18 Super Admin Portal (Port 3001)
│   ├── SELLER/               # Next.js 15 Seller Dashboard (Port 3003)
│   ├── Dockerfile            # Container definitions per service
│   └── docker-compose.yml    # Unified Compose for all Frontends
│
├── docker-compose.yml        # Full-Stack Master Docker Orchestration
├── DOCKER_DEPLOYMENT_GUIDE.md# Complete Docker & Cloud Deployment Guide
└── .env.example              # Environment variables template
```

---

## ⚡ Quick Start: 3 Ways to Run

### Option 1: Run All Services at Once Locally (Fastest) ⚡
To start the Backend API, Admin Dashboard, Customer Website, and Seller Dashboard all together with one command:

```bash
# In the root project folder:
npm start
# OR double-click: run-all.bat
# OR run in PowerShell: .\run-all.ps1
```

---

### Option 2: Run Full Stack with Docker 🐳

#### Access Links:
- 🛍 **Customer Website**: [http://localhost:3002](http://localhost:3002)
- ⚙️ **Admin Panel**: [http://localhost:3001](http://localhost:3001)
- 🏪 **Seller Dashboard**: [http://localhost:3003](http://localhost:3003)
- ⚡ **Backend API**: [http://localhost:5000](http://localhost:5000)
- 📖 **Swagger API Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

### Option 2: Run Microservices Individually with Docker

#### A. Run Backend & Redis Only:
```bash
cd BACKEND
docker compose up --build -d
```

#### B. Run All Frontends (Website + Admin + Seller):
```bash
cd FRONTEND
docker compose up --build -d
```

#### C. Run Any Specific Frontend:
```bash
# Customer Website
cd FRONTEND/WEBSITE && docker compose up --build -d

# Admin Panel
cd FRONTEND/ADMIN && docker compose up --build -d

# Seller Dashboard
cd FRONTEND/SELLER && docker compose up --build -d
```

---

### Option 3: Run Locally using Node.js / npm

#### 1. Backend Server:
```bash
cd BACKEND
npm install
npm run dev
```

#### 2. Website Storefront:
```bash
cd FRONTEND/WEBSITE
npm install
npm run dev
```

#### 3. Admin Panel:
```bash
cd FRONTEND/ADMIN
npm install
npm start
```

#### 4. Seller Dashboard:
```bash
cd FRONTEND/SELLER
npm install
npm run dev
```

---

## 🌐 Dynamic Host IP & Cross-Machine Access

This project has **no hardcoded `localhost` or hardcoded local IPs**. 

If you access the application from any computer, phone, or tablet on your network or server IP (e.g. `http://192.168.1.100:3002` or `https://yourdomain.com`):
- Frontends automatically derive the API backend hostname using `window.location.hostname`.
- You can also explicitly specify custom API URLs via environment variables (`NEXT_PUBLIC_API_URL`, `REACT_APP_API_URL`).

---

## 🔑 Environment Configuration & JWT Security

The project uses central `.env.example` templates for configuration management:

- [Root .env.example](file:///d:/2912/E-Commerce/.env.example)
- [BACKEND/.env.example](file:///d:/2912/E-Commerce/BACKEND/.env.example)
- [FRONTEND/.env.example](file:///d:/2912/E-Commerce/FRONTEND/.env.example)

### Key Variables:
```env
# Database & Auth
MONGODB_URI=mongodb+srv://outdid:outdid@cluster0.t16a63a.mongodb.net/
JWT_SECRET=your-production-jwt-secret-key-must-be-strong
JWT_EXPIRES_IN=24h

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:5000
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📖 Deployment & Technical Guides

For detailed cloud deployment instructions (Render, AWS, DigitalOcean, VPS, Railway), consult:
- 📄 [DOCKER_DEPLOYMENT_GUIDE.md](file:///d:/2912/E-Commerce/DOCKER_DEPLOYMENT_GUIDE.md)

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB Atlas, Redis, JWT Authentication, Winston, Swagger UI
- **Storefront**: Next.js 16, React 19, Redux Toolkit, Tailwind CSS, Swiper
- **Admin Panel**: React 18, Material-UI (MUI), ApexCharts, Axios
- **Seller Dashboard**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **DevOps**: Docker, Docker Compose, Multi-stage builds