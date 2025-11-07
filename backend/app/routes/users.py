from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from app.database import get_database
from app.utils.security import decode_token, hash_password
from app.dependencies.roles import require_role
from fastapi.responses import JSONResponse
from fastapi import Request


router = APIRouter(prefix="/api/users", tags=["Users"])


async def get_current_user(authorization: str = Header(None)):
    """Extract current user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    try:
        return decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# =======================================================
# List Users (ADMIN only)
# =======================================================
@router.get("/", dependencies=[Depends(require_role(["ADMIN"]))])
async def get_users(role: str | None = Query(None), db=Depends(get_database)):
    """List users by optional role"""
    query = {"roles": {"$in": [role]}} if role else {}
    users = await db.users.find(query).to_list(100)
    for user in users:
        user.pop("password_hash", None)
        user["_id"] = str(user.get("_id"))
    return {"count": len(users), "results": users}


# =======================================================
# Create New User (ADMIN only)
# =======================================================
@router.post("/", dependencies=[Depends(require_role(["ADMIN"]))])
async def create_user(user_data: dict, current_user = Depends(get_current_user)):
    try:
        from ..utils.security import hash_password
        db = get_database()
        existing = await db.users.find_one({"email": user_data.get("email")})
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")

        new_user = {
            "email": user_data.get("email"),
            "password_hash": hash_password(user_data.get("password", "defaultpassword")),
            "roles": user_data.get("roles", []),
            "is_active": True
        }

        result = await db.users.insert_one(new_user)
        new_user["_id"] = str(result.inserted_id)
        new_user.pop("password_hash", None)
        return new_user
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal Server Error: {str(e)}"}
        )
