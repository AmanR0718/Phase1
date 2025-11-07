## Purpose

Short, actionable guidance for AI coding agents working in this repository (frontend + backend).

## Big picture
- Backend: FastAPI app in `backend/app` (entry: `backend/app/main.py`). MongoDB is used (async via `motor`) and Celery + Redis are used for background tasks (`backend/app/tasks/*`).
- Frontend: React + TypeScript + Vite in `frontend/` (entry: `frontend/src/main.tsx`). API client is `frontend/src/utils/axios.ts` and UI services are in `frontend/src/services/`.
- Local dev & orchestration: `docker-compose.yml` brings up `farmer-backend`, `farmer-worker`, `farmer-mongo`, `farmer-redis`, and optional `farmer-frontend`.

## Key files to inspect for changes
- `backend/app/main.py` — app and CORS setup.
- `backend/app/config.py` and `backend/.env` — required env variables; many fields use `Field(...)` and are required.
- `backend/app/database.py` — uses `motor.AsyncIOMotorClient` for async DB access.
- `backend/app/tasks/*.py` — Celery tasks use a sync `pymongo.MongoClient` intentionally (documented in code).
- `frontend/src/utils/axios.ts` — central API base URL + interceptors (auto-refresh token logic).
- `frontend/src/services/*.ts` — service layer (e.g. `farmer.service.ts`, `auth.service.ts`) — prefer using these rather than raw axios calls.
- `frontend/package.json` — scripts: `npm run dev` (vite), `npm run build` (`tsc -b && vite build`), `npm run lint`.
- `docker-compose.yml` — orchestration and environment variables (important mismatch noted below).

## Project-specific conventions & patterns
- Frontend uses a small service layer (`frontend/src/services/*`) to wrap API calls — prefer `farmerService.create(...)` or `authService.login(...)` over ad-hoc axios usage.
- Auth state is stored in a Zustand store (`frontend/src/store/authStore.ts`) and tokens are persisted to `localStorage`. Axios request interceptor reads token from `localStorage` or the store.
- Axios response interceptor attempts a single auto-refresh by POSTing to `/auth/refresh` and will call the store's `logout()` + redirect to `/login` on failure. Avoid changes that break this flow.
- Backend mixes async (`motor`) and sync (`pymongo`) clients: `motor` for request-handling code; `pymongo` is used intentionally inside Celery worker tasks (see `backend/app/tasks/id_card_task.py`).

## Known issues & inconsistencies (actionable)
1. Frontend env mismatch: `docker-compose.yml` sets `VITE_API_URL` for the `farmer-frontend` service, but code reads `VITE_API_BASE_URL` in `frontend/src/utils/axios.ts`. Result: the app can fall back to the hard-coded github.dev URL. Fix: unify to one name (prefer `VITE_API_BASE_URL`) and update `docker-compose.yml`.
2. Hard-coded remote defaults: `frontend/src/utils/axios.ts` and `vite.config.ts` include a hard-coded github.dev URL as fallback/target. Replace with local defaults (e.g., `http://localhost:8000`) or rely on env vars.
3. Debugging console output left in code: `console.log` appears in `frontend/src/utils/axios.ts` and `vite.config.ts`. Remove or gate them behind a DEBUG flag.
4. Type looseness and `as any`: there are multiple `as any` usages (e.g. in `FarmerRegistration.tsx`) while `tsconfig.json` enables `strict: true`. Consider adding explicit types to reduce hidden runtime errors.
5. Duplicate/backups and untracked artifacts: there are `.bak` files and a `frontend_backup/` folder (e.g. `FarmerRegistration.tsx.bak`) — these confuse search and maintenance. Consider moving backups outside the repo or deleting them.
6. Requirements/deps: `backend/requirements.txt` contains both `motor` and `pymongo` (this is intentional), but some packages (Pillow, qrcode, fpdf2) are unpinned. Consider pinning for reproducible builds.
7. Multiple `requirements.txt` files at repo root and `backend/requirements.txt` — keep one canonical source for CI/build.

## Developer workflows & commands
- Full dev stack (recommended): from repo root
  - docker-compose up --build
    - This runs the FastAPI server (uvicorn), Celery worker, Redis, and MongoDB (see `docker-compose.yml`). Backend reads `backend/.env`.
- Frontend only (local dev):
  - cd frontend
  - npm install
  - npm run dev
  - Notes: `frontend/src/utils/axios.ts` expects `VITE_API_BASE_URL` (see `.env` in `frontend/`).
- Backend only (local dev):
  - cd backend
  - pip install -r requirements.txt
  - uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## Quick places for fixes (examples)
- Fix env mismatch: update `docker-compose.yml` environment for `farmer-frontend` to `VITE_API_BASE_URL=http://localhost:8000`.
- Remove the fallback hard-coded URL in `frontend/src/utils/axios.ts` or change fallback to `http://localhost:8000`.
- Replace `console.log` with a small `debug()` helper that checks `import.meta.env.DEV`.
- Tighten types in `frontend/src/pages/*` (start with `FarmerRegistration.tsx`) to eliminate `as any` casts.

## When editing backend code
- Check `backend/app/config.py` for required env vars (many use `Field(...)`). Missing vars will raise on startup. Use `backend/.env` as template.
- When adding background work, prefer Celery tasks placed under `backend/app/tasks/` and use `pymongo` sync client for Celery worker code if needed (current pattern).

## Where to look for related code
- API routes: `backend/app/routes/*` (e.g. `farmers.py`, `auth.py`, `uploads.py`).
- Celery config: `backend/app/tasks/celery_app.py`.
- Frontend services: `frontend/src/services/*` and API wrapper `frontend/src/utils/axios.ts`.

If anything here looks wrong or you'd like me to (1) apply the `VITE_API_BASE_URL` fix in `docker-compose.yml` and `frontend/src/utils/axios.ts`, (2) remove debug logs and create a small debug helper, or (3) tighten types in a few components, say which and I'll implement the changes.

-- End