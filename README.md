# Cipherville – Crime Investigation Challenge

Production-ready full-stack game platform for a college technical fest, built with React, Node, MongoDB, and SQLite.

## Project Structure

```
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    socket/
    utils/
  storage/
  sample-data/
frontend/
  src/
    components/
    pages/
    providers/
    styles/
```

## Backend Setup

1. Copy environment file

```
cp backend/.env.example backend/.env
```

2. Install and run

```
cd backend
npm install
npm run dev
```

### Backend Environment

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Admin JWT secret
- `ADMIN_DEFAULT_USER` / `ADMIN_DEFAULT_PASS`: Bootstrap admin account
- `UPLOAD_DIR`, `SQLITE_TEMPLATE_DIR`, `SQLITE_USER_DIR`: Storage paths

## Frontend Setup

1. Copy environment file

```
cp frontend/.env.example frontend/.env
```

2. Install and run

```
cd frontend
npm install
npm run dev
```

## Deployment

### Backend (VPS)

- Install Node.js 18+ on the VPS
- Configure environment variables
- Use `pm2` or `systemd` to keep the server running
- Open port `4000` (or set `PORT`)

### Frontend (Vercel)

- Connect the `frontend` folder to Vercel
- Configure `VITE_API_URL` and `VITE_SOCKET_URL`
- Build command: `npm run build`
- Output: `dist`

## Notes

- Upload SQLite templates via Admin Story Management. The template file name is `storyId.db`.
- Evidence Excel files are imported into MongoDB for quick access.
- SQL queries are limited to read-only `SELECT`/`WITH` statements.
