from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database and config
try:
    from app.config import settings
    from app.database import close_database
except:
    settings = None
    close_database = None

# Import all routers
from app.routes import health

try:
    from app.routes import auth, farmers, sync, uploads, farmers_qr, users, geo
    all_routes_available = True
except ImportError as e:
    print(f"Warning: Some routes not available: {e}")
    all_routes_available = False

# Initialize FastAPI app
app = FastAPI(
    title="Zambian Farmer System API",
    description="Backend API for Zambian Farmer Registration & Support System",
    version="1.5",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ==========================================
# CRITICAL: CORS MIDDLEWARE - MUST BE FIRST
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow ALL origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow ALL methods (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"],  # Allow ALL headers
    expose_headers=["*"],
)

# Register health check first
app.include_router(health.router)

# Register other routers if available
if all_routes_available:
    app.include_router(auth.router)
    app.include_router(farmers.router)
    app.include_router(farmers_qr.router)
    app.include_router(users.router)
    app.include_router(geo.router)
    app.include_router(sync.router)
    app.include_router(uploads.router)

# Shutdown event
if close_database:
    @app.on_event("shutdown")
    async def shutdown():
        await close_database()

# Root endpoint
@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Zambian Farmer System API is running",
        "status": "ok",
        "version": "1.5",
        "cors": "enabled"
    }

# Health check
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "cors": "enabled"}
