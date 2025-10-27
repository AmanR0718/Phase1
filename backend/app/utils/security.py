from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from ..config import settings
import hmac, hashlib, base64

# -------------------------------
# 🔐 Password Hashing
# -------------------------------
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password[:72])  # bcrypt max length = 72 chars

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

# -------------------------------
# 🔑 JWT Tokens
# -------------------------------
def create_token(subject: str, expires_delta: int, token_type: str):
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    payload = {"sub": subject, "type": token_type, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_access_token(subject: str):
    """Short-lived access token"""
    return create_token(subject, settings.ACCESS_TOKEN_EXPIRE_MINUTES, "access")

def create_refresh_token(subject: str):
    """Long-lived refresh token"""
    return create_token(subject, settings.REFRESH_TOKEN_EXPIRE_MINUTES, "refresh")

def decode_token(token: str):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")

# -------------------------------
# 🧾 QR Code Signing & Verification
# -------------------------------
def sign_qr_payload(data: dict) -> str:
    """
    Create a secure HMAC signature for a farmer’s QR payload.
    Expects data: {"farmer_id": "...", "timestamp": "..."}
    """
    msg = f"{data['farmer_id']}|{data['timestamp']}"
    sig = hmac.new(settings.SECRET_KEY.encode(), msg.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(sig).decode()

def verify_qr_signature(payload: dict) -> bool:
    """
    Validate a QR code’s signature using the server secret.
    """
    try:
        expected = sign_qr_payload(payload)
        provided = payload.get("signature", "")
        return hmac.compare_digest(expected, provided)
    except Exception:
        return False
