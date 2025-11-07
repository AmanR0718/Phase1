# backend/app/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from functools import lru_cache
from typing import Optional
import logging

logger = logging.getLogger(__name__)

_client: Optional[AsyncIOMotorClient] = None


@lru_cache()
def get_client() -> AsyncIOMotorClient:
    """Initialize or return existing MongoDB client"""
    global _client
    if not _client:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}")
        _client = AsyncIOMotorClient(settings.MONGODB_URL)
    return _client


def get_database():
    """Return main MongoDB database handle"""
    client = get_client()
    return client[settings.MONGODB_DB_NAME]


async def close_database():
    """Gracefully close the MongoDB connection"""
    global _client
    if _client:
        logger.info("Closing MongoDB connection...")
        _client.close()
        _client = None
