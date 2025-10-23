from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, farmers, sync
from fastapi.staticfiles import StaticFiles
from app.routes import farmers, auth, uploads

app = FastAPI(title="Zambian Farmer System - Phase1")
app.include_router(sync.router)
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(uploads.router)

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
    
