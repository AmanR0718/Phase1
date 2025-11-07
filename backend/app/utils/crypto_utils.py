# backend/app/utils/crypto_utils.py
import base64, hashlib
from Crypto.Cipher import AES
from app.config import settings


def _derive_key() -> bytes:
    """Derive AES key from JWT secret"""
    return hashlib.sha256(settings.JWT_SECRET.encode()).digest()


def encrypt_deterministic(value: str) -> str:
    """
    Deterministic AES-GCM encryption for non-PII indexing.
    WARNING: Do NOT use for sensitive passwords (use bcrypt instead).
    """
    key = _derive_key()
    nonce = hashlib.sha1(value.encode()).digest()[:12]
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, _ = cipher.encrypt_and_digest(value.encode())
    return base64.urlsafe_b64encode(ciphertext).decode()


def decrypt_deterministic(value_b64: str, sample_input: str) -> str:
    """Decrypt AES-GCM deterministic ciphertext"""
    key = _derive_key()
    nonce = hashlib.sha1(sample_input.encode()).digest()[:12]
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    data = base64.urlsafe_b64decode(value_b64.encode())
    return cipher.decrypt(data).decode(errors="ignore")


def hmac_hash(value: str) -> str:
    """Compute simple HMAC-based hash for indexing"""
    key = settings.JWT_SECRET.encode()
    return hashlib.sha256(key + value.encode()).hexdigest()
