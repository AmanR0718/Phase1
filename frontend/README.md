# Phase1 Frontend (React)

Minimal React (Vite) app to interact with the Phase1 backend.

Features:

- Login (POST /api/auth/login)
- List and create farmers (GET/POST /api/farmers)
- Upload photo for a farmer (POST /api/farmers/{id}/upload-photo)
- Send sync batch (POST /api/sync/batch)

How to run:

1. Open a terminal and cd into `frontend`.

For Windows (cmd.exe):

```
cd frontend
npm install
npm run dev
```

2. The app will open at http://localhost:5173 by default. It calls the backend at http://localhost:8000. If your backend is running somewhere else, set the env var `VITE_API_BASE` before running Vite.

Notes:

- This is intentionally small and unstyled. It's meant as a developer admin UI. Backend has CORS enabled already.
- Do not modify backend files; this frontend only reads/writes via HTTP.
