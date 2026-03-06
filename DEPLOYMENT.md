# Deployment Guide

## Local Development
1. Install dependencies:
   ```bash
   npm install
   cd dashboard && npm install
   ```
2. Copy env files if needed:
   - Root: `.env.example` -> `.env`
   - Dashboard: `dashboard/.env.example` -> `dashboard/.env`
3. Start everything:
   ```bash
   npm run dev
   ```
4. Open:
   - Dashboard: `http://localhost:3000`
   - API: `http://localhost:5000`

## Network Deployment (without Docker)
1. In root `.env`, set:
   ```env
   PORT=5000
   SERVER_HOST=0.0.0.0
   MONGO_URI=mongodb://<MONGO_HOST>:27017/projectdb
   MONGO_DB_NAME=projectdb
   ```
2. In `dashboard/.env`, use one of these:
   - Proxy mode (recommended):
     ```env
     BACKEND_INTERNAL_URL=http://10.10.11.97:5000
     NEXT_PUBLIC_API_BASE_URL=/backend
     VITE_API_BASE_URL=/backend
     ```
   - Direct client-to-API mode:
     ```env
     NEXT_PUBLIC_API_BASE_URL=http://10.10.11.97:5000
     VITE_API_BASE_URL=http://10.10.11.97:5000
     ```
3. Start backend and frontend:
   ```bash
   npm run server
   cd dashboard && npm run dev
   ```
4. Access from other laptops:
   - `http://10.10.11.97:3000`

## Docker Deployment
1. Start all services:
   ```bash
   docker compose up --build
   ```
2. Services:
   - MongoDB: `mongo:6` (data persisted in `mongo_data` volume)
   - Backend: `http://<SERVER_IP>:5000`
   - Frontend: `http://<SERVER_IP>:3000`
3. Stop:
   ```bash
   docker compose down
   ```

## Future Server IP Migration
If server IP changes, update frontend env and rebuild:

1. Edit `dashboard/.env`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://NEW_SERVER_IP:5000
   VITE_API_BASE_URL=http://NEW_SERVER_IP:5000
   ```
   Or keep proxy mode and only update:
   ```env
   BACKEND_INTERNAL_URL=http://NEW_SERVER_IP:5000
   NEXT_PUBLIC_API_BASE_URL=/backend
   VITE_API_BASE_URL=/backend
   ```
2. Rebuild frontend:
   ```bash
   cd dashboard
   npm run build
   npm run start -- -H 0.0.0.0 -p 3000
   ```
