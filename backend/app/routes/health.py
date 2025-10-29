from fastapi import APIRouter
from pymongo import MongoClient
from redis import Redis
from celery import Celery
import os

router = APIRouter(prefix="/health", tags=["Health"])

# Initialize Celery
celery_app = Celery("farmer_sync", broker=os.getenv("REDIS_URL", "redis://redis:6379/0"))

@router.get("/full")
def full_health_check():
    status = {
        "mongo": False,
        "redis": False,
        "celery": False,
        "disk": False,
    }

    # MongoDB check
    try:
        mongo_url = os.getenv("MONGODB_URL")
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
        client.server_info()
        status["mongo"] = True
    except Exception as e:
        status["mongo_error"] = str(e)

    # Redis check
    try:
        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
        redis_client = Redis.from_url(redis_url)
        redis_client.ping()
        status["redis"] = True
    except Exception as e:
        status["redis_error"] = str(e)

    # Celery check
    try:
        ping = celery_app.control.ping(timeout=2)
        status["celery"] = bool(ping)
    except Exception as e:
        status["celery_error"] = str(e)

    # Disk write check
    try:
        test_path = os.path.join(os.getenv("UPLOAD_DIR", "./uploads"), "health_test.txt")
        with open(test_path, "w") as f:
            f.write("ok")
        os.remove(test_path)
        status["disk"] = True
    except Exception as e:
        status["disk_error"] = str(e)

    all_ok = all(status[k] for k in ["mongo", "redis", "celery", "disk"])
    return {"status": "ok" if all_ok else "degraded", "components": status}
