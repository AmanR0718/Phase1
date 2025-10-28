from celery import Celery
import os

# Redis broker URL
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Celery app initialization
celery_app = Celery(
    "farmer_sync",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.id_card_task"],  # 👈 Ensure your task module is imported
)

# Configuration for reliability and compatibility
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=3600,
    timezone="UTC",
    enable_utc=True,
)

# Optional: define routing if you ever expand
celery_app.conf.task_routes = {
    "app.tasks.id_card_task.generate_id_card": {"queue": "celery"},
}
