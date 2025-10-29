from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, farmers, sync
from fastapi.staticfiles import StaticFiles
from app.routes import farmers, auth, uploads
from app.routes import farmers_qr
from app.routes import health


app = FastAPI(title="Zambian Farmer System - Phase1")
app.include_router(sync.router)
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(uploads.router)
app.include_router(farmers_qr.router)
app.include_router(health.router)


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status":"ok"}
    
