from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from fastapi import Header
from ..database import get_database
from ..utils.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginIn(BaseModel):
    username: str
    password: str

class RefreshIn(BaseModel):
    refresh_token: str

@router.post("/login")
async def login(payload: LoginIn):
    db = get_database()
    user_doc = await db.users.find_one({"email": payload.username.lower().strip()})
    if not user_doc or not verify_password(payload.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(user_doc["email"])
    refresh_token = create_refresh_token(user_doc["email"])
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"email": user_doc["email"], "roles": user_doc.get("roles", [])}
    }

@router.post("/refresh")
async def refresh_token(payload: RefreshIn):
    try:
        data = decode_token(payload.refresh_token)
        if data.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        new_access_token = create_access_token(data["sub"])
        return {"access_token": new_access_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


@router.get("/me")
async def get_current_user(authorization: str | None = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        email = payload.get("sub")
        db = get_database()
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "email": user["email"],
            "roles": user.get("roles", []),
            "token_type": payload.get("type")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")