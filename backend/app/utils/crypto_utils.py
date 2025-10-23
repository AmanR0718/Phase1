
import base64, hashlib, os
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from ..config import settings

# deterministic AES-GCM encryption using a fixed nonce derived from input hash
def encrypt_deterministic(value: str) -> str:
    key = hashlib.sha256(settings.JWT_SECRET.encode()).digest()
    nonce = hashlib.sha1(value.encode()).digest()[:12]
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(value.encode())
    return base64.urlsafe_b64encode(ciphertext).decode()

def decrypt_deterministic(value_b64: str, sample_input: str) -> str:
    key = hashlib.sha256(settings.JWT_SECRET.encode()).digest()
    nonce = hashlib.sha1(sample_input.encode()).digest()[:12]
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    data = base64.urlsafe_b64decode(value_b64.encode())
    return cipher.decrypt(data).decode(errors="ignore")

def hmac_hash(value: str) -> str:
    key = settings.JWT_SECRET.encode()
    return hashlib.sha256(key + value.encode()).hexdigest()
