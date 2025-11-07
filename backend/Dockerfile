# ===============================================
# Zambian Farmer System Backend Dockerfile
# Base: Python 3.11-slim with image libraries
# ===============================================

FROM python:3.11-slim

# Environment setup
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# ---------- Install required system tools ----------
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    netcat-openbsd \
    libjpeg-dev \
    zlib1g-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# ---------- Install Python dependencies ----------
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# ---------- Copy application code ----------
COPY app ./app
COPY .env ./.env
COPY scripts ./scripts

# Create necessary upload directories (mounted via volume, but ensure path exists)
RUN mkdir -p /app/uploads/photos /app/uploads/idcards /app/uploads/documents

# ---------- Expose port ----------
EXPOSE 8000

# ---------- Healthcheck ----------
HEALTHCHECK CMD curl --fail http://localhost:8000/health/full || exit 1


# ---------- Startup command ----------
CMD ["sh", "-c", "\
until nc -z farmer-mongo 27017; do echo '⏳ Waiting for Mongo...'; sleep 3; done && \
echo '✅ Mongo is ready! Starting backend...' && \
python scripts/seed_admin.py || true && \
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]

