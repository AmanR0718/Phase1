from fastapi import Depends, Header, HTTPException, status
from app.utils.security import decode_token
from app.database import get_database


async def get_current_user(authorization: str = Header(None), db=Depends(get_database)):
    """
    Extract and verify JWT token from the Authorization header.
    Returns the full user document from MongoDB.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        # Allow both "Bearer <token>" and "<token>" formats
        if " " in authorization:
            scheme, token = authorization.split(" ", 1)
        else:
            token = authorization

        payload = decode_token(token)
        email = payload.get("sub")

        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token error: {str(e)}")


def require_role(allowed_roles: list[str]):
    """
    Dependency factory for enforcing RBAC.
    Example: @Depends(require_role(["ADMIN", "OPERATOR"]))
    """
    async def role_checker(user=Depends(get_current_user)):
        user_roles = user.get("roles", [])
        if not any(role in allowed_roles for role in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}",
            )
        return user

    return role_checker
