from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from ..config import settings
import hmac, hashlib, base64

# -------------------------------
# Password Hashing
# -------------------------------
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password (bcrypt max length = 72 chars)."""
    return pwd_ctx.hash(password[:72])

def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_ctx.verify(plain, hashed)

# -------------------------------
# JWT Tokens
# -------------------------------
def create_token(subject: str, expires_minutes: int, token_type: str) -> str:
    """Generic token creator with expiry in minutes."""
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload = {"sub": subject, "type": token_type, "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_access_token(subject: str) -> str:
    """Short-lived access token."""
    return create_token(subject, settings.ACCESS_TOKEN_EXPIRE_MINUTES, "access")

def create_refresh_token(subject: str) -> str:
    """Long-lived refresh token (uses days → minutes)."""
    minutes = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60
    return create_token(subject, minutes, "refresh")

def decode_token(token: str) -> dict:
    """Decode and validate JWT token."""
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")

# -------------------------------
# QR Code Signing & Verification
# -------------------------------
def sign_qr_payload(data: dict) -> str:
    """
    Create a secure HMAC signature for a farmer’s QR payload.
    Expects data: {"farmer_id": "...", "timestamp": "..."}
    """
    farmer_id = data.get("farmer_id")
    timestamp = data.get("timestamp")
    if not farmer_id or not timestamp:
        raise ValueError("Missing farmer_id or timestamp for QR signing")

    msg = f"{farmer_id}|{timestamp}"
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
