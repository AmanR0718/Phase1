from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth, farmers, sync, uploads, farmers_qr, health

app = FastAPI(title="Zambian Farmer System - Phase1")

# ========== ADD CORS FIRST (BEFORE ROUTES) ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://*.app.github.dev",
        "https://*.github.dev",
        "https://*.githubpreview.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
# ====================================================

# Then include routers
app.include_router(health.router)
app.include_router(sync.router)
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(uploads.router)
app.include_router(farmers_qr.router)

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
