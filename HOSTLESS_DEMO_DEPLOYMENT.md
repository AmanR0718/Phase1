# Hostless demo deployment

This guide deploys the ZIAMIS CEM FastAPI API and one Celery worker from the existing `deploy` branch. The frontend remains a separately built web app or Android APK; configure its API URL to the HTTPS URL Hostless assigns to the backend.

## Before deployment

1. Rotate every credential that was ever committed to this repository, especially the exposed PEM key and the MongoDB, Redis, JWT, admin, and cloud credentials. Removing files from `deploy` does not erase Git history. Revoke the old key and do not reuse any committed credential.
2. Connect Hostless to `amanrax/Phase1` and select the existing `deploy` branch. Keep the app build configuration pointed at the root `hostless.yaml`.
3. Provision reachable MongoDB and TLS-enabled Redis services. Hostless managed database URLs or external services can be used. Supply Redis as `REDIS_URL`; URLs beginning with `rediss://` are supported.

## Hostless environment variables

Set these values in the Hostless app's secret/environment settings. Do not put production values in Git or in a frontend build artifact.

| Variable | Purpose |
| --- | --- |
| `MONGODB_URL` | MongoDB connection URI |
| `MONGODB_DB_NAME` | MongoDB database name |
| `REDIS_URL` | Redis broker/result URI; use `rediss://` for TLS |
| `JWT_SECRET` | Random signing secret, at least 32 characters |
| `SECRET_KEY` | Separate random encryption secret, at least 32 characters |
| `SEED_ADMIN_EMAIL` | Initial administrator email |
| `SEED_ADMIN_PASSWORD` | Initial administrator password |
| `ENVIRONMENT` | Set to `production` |
| `DEBUG` | Set to `false` |
| `CORS_ORIGINS` | JSON array containing deployed frontend origin(s) |

The web process listens on Hostless's `PORT`, binds to `0.0.0.0`, and serves health checks at `/api/health`. The configuration starts one FastAPI replica and one Celery worker replica. Set frontend build variables `VITE_API_BASE_URL`, `VITE_API_PROD_URL`, and/or `VITE_MOBILE_API_URL` to the assigned HTTPS API URL when building a web bundle or APK. Production builds have no localhost or obsolete-IP fallback.

## Local Docker Compose

Copy the example and replace every placeholder with fresh development values:

```sh
cp .env.local.example .env.local
docker compose up --build
```

Compose reads the untracked root `.env.local` for both the API and worker. Keep it local; the repository ignores it. Local Redis is available at `redis://farmer-redis:6379/0`.

## Verification

After Hostless reports a healthy release:

- Open `https://<hostless-api-host>/api/health` and confirm a successful health response.
- Open `https://<hostless-api-host>/docs` and check the API documentation loads.
- Exercise sign-in and one representative farmer read/write flow from the configured frontend.
- Confirm the Celery worker is running and a queued ID-card task completes.
- Review service logs for startup and validation events. Connection URIs and submitted validation values should not appear in logs or 422 responses.

For local verification, use `docker compose ps` and `docker compose logs farmer-backend celery-worker`; do not paste secret values into shared logs or reports.

## Rebuilding the Android APK

Vite embeds API settings at build time. Set the production HTTPS URL before building; rebuild after changing the backend URL:

```sh
cd frontend
npm ci
VITE_API_BASE_URL=https://<hostless-api-host> VITE_API_PROD_URL=https://<hostless-api-host> VITE_MOBILE_API_URL=https://<hostless-api-host> npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

On Windows, use `gradlew.bat assembleDebug`. The debug APK is written under `frontend/android/app/build/outputs/apk/debug/`. Install and test it on a device before the demo. Do not publish an APK containing demo credentials or secrets.
