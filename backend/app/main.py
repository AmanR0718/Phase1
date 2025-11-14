# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import close_database

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
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://glowing-fishstick-xg76vqgjxxph67ww-5173.app.github.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.app\.github\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Access-Control-Allow-Origin"],
)



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
app.include_router(geo.router)

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
