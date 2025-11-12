
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import close_database
import os 
import re
from fastapi.responses import JSONResponse  
from fastapi.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
# Routers
from app.routes import auth, farmers, sync, uploads, farmers_qr, health, users, geo


# ------------------------------------
# Initialize app
# ------------------------------------
app = FastAPI(
    title="Zambian Farmer System API",
    description="Backend API for Zambian Farmer Registration & Support System",
    version="1.5",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ------------------------------------
# CORS Configuration
# ------------------------------------
# backend/app/main.py
frontend_origin_env = os.getenv("FRONTEND_ORIGIN", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://localhost:5173",
    "https://127.0.0.1:5173",
    "https://glowing-fishstick-xg76vqgjxxph67ww-5173.app.github.dev",
]

if frontend_origin_env:
    allowed_origins.append(frontend_origin_env)

# ✅ Apply both exact list and regex for Codespaces
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https:\/\/[-a-z0-9]+-(5173|8000)\.app\.github\.dev$",
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EnsureCORSHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        origin = request.headers.get("origin")
        if origin and (
            origin.endswith("-5173.app.github.dev") or
            origin.endswith("-8000.app.github.dev") or
            "localhost" in origin
        ):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

app.add_middleware(EnsureCORSHeadersMiddleware)

# ------------------------------------
# Register Routers
# ------------------------------------
app.include_router(health.router)
app.include_router(sync.router)
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(uploads.router)
app.include_router(users.router)
app.include_router(farmers_qr.router)
app.include_router(geo.router, prefix="/api/geo", tags=["geo"])

@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    """Handle preflight requests explicitly (for Codespaces CORS)"""
    origin = request.headers.get("origin")
    response = JSONResponse(content={"message": "CORS preflight OK"})
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization,Content-Type"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
# ------------------------------------
# Lifecycle events
# ------------------------------------
@app.on_event("startup")
async def startup_event():
    print("🚀 Application startup complete.")
    # Mongo connection will auto-init on first DB access


@app.on_event("shutdown")
async def shutdown_event():
    await close_database()
    print("🧹 MongoDB connection closed.")


# ------------------------------------
# Root Route
# ------------------------------------
@app.get("/")
async def root():
    return {"message": "Zambian Farmer System API is running", "status": "ok"}
