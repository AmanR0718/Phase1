from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from ..config import settings

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password[:72])

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_token(subject: str, expires_delta: int, token_type: str):
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    payload = {"sub": subject, "type": token_type, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_access_token(subject: str):
    return create_token(subject, settings.ACCESS_TOKEN_EXPIRE_MINUTES, "access")

def create_refresh_token(subject: str):
    return create_token(subject, settings.REFRESH_TOKEN_EXPIRE_MINUTES, "refresh")

def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")
