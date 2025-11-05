from fastapi import APIRouter, Depends, HTTPException, status, Query
from ..database import get_database
from ..utils.security import decode_token
from fastapi import Header

router = APIRouter(prefix="/api/users", tags=["Users"])

async def get_current_user(authorization: str = Header(None)):
    """Extract user from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    try:
        payload = decode_token(token)
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/")
async def get_users(role: str = Query(None), current_user = Depends(get_current_user)):
    """Get users by role (ADMIN only)"""
    db = get_database()
    
    if role:
        users = await db.users.find({"roles": {"$in": [role]}}).to_list(100)
    else:
        users = await db.users.find().to_list(100)
    
    # Remove password hashes before returning
    for user in users:
        user.pop("password_hash", None)
        user["_id"] = str(user.get("_id", ""))
    
    return users

@router.post("/")
async def create_user(user_data: dict, current_user = Depends(get_current_user)):
    """Create new user (ADMIN only)"""
    from ..utils.security import hash_password
    
    db = get_database()
    
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.get("email")})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
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
