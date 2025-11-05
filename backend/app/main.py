from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, farmers, sync, uploads, farmers_qr, health, users

app = FastAPI(title="Zambian Farmer System")

# CORS must be first middleware!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# Routes
app.include_router(health.router)
app.include_router(sync.router)
app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(uploads.router)
app.include_router(users.router)
app.include_router(farmers_qr.router)

@app.get("/")
async def root():
    return {"message": "API Running"}
