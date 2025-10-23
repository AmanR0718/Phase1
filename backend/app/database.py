from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
_client = None
def get_client():
    global _client
    if not _client:
        _client = AsyncIOMotorClient(settings.MONGO_URI)
    return _client
def get_database():
    return get_client()[settings.MONGO_DB]
