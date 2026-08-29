# E-Commerce Docker & Cloud Deployment Guide 🚀

This document details how to run the entire E-Commerce microservice suite locally using Docker Compose, access it from any machine on your network (dynamic host IP / domain support), and deploy it to cloud environments (Render, AWS, DigitalOcean, Railway, Fly.io, or VPS).

---

## 🛠 Microservice Architecture & Port Mapping

| Service | Technology | Port | Access URL | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Node.js / Express | `5000` | `http://<SERVER_IP>:5000` | Core REST API, Swagger docs at `/api-docs` |
| **Website Storefront** | Next.js 16 / React 19 | `3002` | `http://<SERVER_IP>:3002` | E-Commerce customer shopping experience |
| **Admin Dashboard** | React / MUI | `3001` | `http://<SERVER_IP>:3001` | Super admin portal for products, orders, KYC |
| **Seller Dashboard** | Next.js 15 / React 19 | `3003` | `http://<SERVER_IP>:3003` | Seller dashboard for managing inventory |
| **Redis Cache** | Redis 7 Alpine | `6379` | `localhost:6379` | High-performance cache & background job queue |
| **Database** | MongoDB Atlas | Cloud | `mongodb+srv://...` | Cloud MongoDB cluster connection |

---

## ⚡ Quick Start: Single Command Local & LAN Run

### 1. Prerequisite
Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.

### 2. Launch All Microservices (Full Stack)
Run from the root directory:

```bash
docker compose up --build -d
```

---

### 3. Launch Services Individually (Standalone Mode)
You can also run any microservice independently by navigating into its folder:

- **All Frontend Apps Together (Website, Admin, Seller)**:
  ```bash
  cd FRONTEND
  docker compose up --build -d
  ```
- **Backend & Redis**:
  ```bash
  cd BACKEND
  docker compose up --build -d
  ```
- **Website Storefront**:
  ```bash
  cd FRONTEND/WEBSITE
  docker compose up --build -d
  ```
- **Admin Dashboard**:
  ```bash
  cd FRONTEND/ADMIN
  docker compose up --build -d
  ```
- **Seller Dashboard**:
  ```bash
  cd FRONTEND/SELLER
  docker compose up --build -d
  ```

### 3. Check Container Status
```bash
docker compose ps
```

### 4. View Container Logs
```bash
# View logs of all services
docker compose logs -f

# View backend logs specifically
docker compose logs -f backend
```

---

## 🌐 Dynamic Host IP & Cross-Machine Access

The application **does NOT hardcode `localhost` or specific local IPs**. 

When accessing the frontend applications from any machine (PC, phone, tablet) on your local network or internet:
- Frontends automatically derive the server hostname via `window.location.hostname`.
- If you access `http://192.168.1.50:3002`, the frontend will automatically direct backend requests to `http://192.168.1.50:5000`.

### Custom Machine IP Override
If you want to explicitly define the backend IP for frontends, set the environment variable when launching Docker Compose:

```bash
NEXT_PUBLIC_API_URL=http://192.168.1.50:5000 REACT_APP_API_URL=http://192.168.1.50:5000/api docker compose up -d
```

---

## 🔑 JWT Authentication & Environment Variables

All JWT token handling is centralized in `BACKEND/utils/jwtUtils.js` and enforced via `BACKEND/middleware/authMiddleware.js`.

### JWT Configuration:
- `JWT_SECRET`: Secret key used for signing & verifying JWT bearer tokens.
- `JWT_EXPIRES_IN`: Expiration time (default: `24h`).

### Environment File References (`.env.example` Templates)
The following template files document all environment variables for each component:
- **Root Full Stack**: [.env.example](file:///d:/2912/E-Commerce/.env.example)
- **Backend API**: [BACKEND/.env.example](file:///d:/2912/E-Commerce/BACKEND/.env.example)
- **Unified Frontend**: [FRONTEND/.env.example](file:///d:/2912/E-Commerce/FRONTEND/.env.example)
- **Website Storefront**: [FRONTEND/WEBSITE/.env.example](file:///d:/2912/E-Commerce/FRONTEND/WEBSITE/.env.example)
- **Admin Dashboard**: [FRONTEND/ADMIN/.env.example](file:///d:/2912/E-Commerce/FRONTEND/ADMIN/.env.example)
- **Seller Dashboard**: [FRONTEND/SELLER/.env.example](file:///d:/2912/E-Commerce/FRONTEND/SELLER/.env.example)

To customize secrets for Docker, simply create a `.env` file in the root or service directory based on the `.env.example` template.

---

## ☁️ Cloud Deployment Strategies

### Option A: Cloud VPS (Ubuntu / Debian / AWS EC2 / DigitalOcean Droplet)
1. Install Docker & Docker Compose on your server.
2. Clone your repository to `/var/www/e-commerce`.
3. Create your `.env` file with your MongoDB Atlas URI and JWT Secret.
4. Run:
   ```bash
   docker compose up -d --build
   ```
5. *(Optional)* Set up Nginx Reverse Proxy & Certbot SSL for HTTPS.

### Option B: Render Deployment (`render.yaml`)
- A pre-configured `render.yaml` is located in the repository root.
- Connect your GitHub repo to Render Dashboard -> New Blueprint Instance.
- Render will automatically deploy backend service and Redis cache.

### Option C: Railway / Fly.io / AWS ECS
- Build individual Dockerfiles:
  - `BACKEND/Dockerfile`
  - `FRONTEND/WEBSITE/Dockerfile`
  - `FRONTEND/ADMIN/Dockerfile`
  - `FRONTEND/SELLER/Dockerfile`

---

## 🛑 Stopping & Resetting Containers

```bash
# Stop all containers
docker compose down

# Stop containers and remove volumes (clean cache)
docker compose down -v
```
