FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# ---------- Install required system tools ----------
RUN apt-get update && apt-get install -y curl netcat-openbsd && rm -rf /var/lib/apt/lists/*

# ---------- Install Python dependencies ----------
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ---------- Copy app code ----------
COPY backend/app ./app
COPY backend/.env ./.env
COPY backend/scripts ./scripts

# ---------- Healthcheck ----------
HEALTHCHECK CMD curl --fail http://localhost:8000/health || exit 1

# ---------- Run server ----------
CMD ["sh", "-c", "apt-get update && apt-get install -y netcat-openbsd && \
until nc -z farmer-mongo 27017; do echo '⏳ Waiting for Mongo...'; sleep 3; done && \
echo '✅ Mongo is ready! Starting backend...' && \
python scripts/seed_admin.py || true && \
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
