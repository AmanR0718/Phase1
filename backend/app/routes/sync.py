from fastapi import APIRouter, Depends, HTTPException, Header, Query
from ..utils.security import decode_token
from ..tasks.celery_app import celery_app
from ..tasks.sync_tasks import process_sync_batch
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/sync", tags=["Sync"])

class SyncRecord(BaseModel):
    temp_id: Optional[str]
    nrc_number: Optional[str] = None
    personal_info: dict
    address: dict

class SyncRequest(BaseModel):
    farmers: List[SyncRecord]
    last_sync: Optional[str] = None

async def get_current_user(authorization: str | None = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        scheme, token = authorization.split()
        payload = decode_token(token)
        return payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/batch")
async def sync_batch(payload: SyncRequest, current_user=Depends(get_current_user)):
    # enqueue Celery job and return job id
    farmers_payload = [f.dict() for f in payload.farmers]
    task = process_sync_batch.apply_async(args=[current_user, farmers_payload])
    return {"job_id": task.id, "status": "queued"}

@router.get("/status")
async def sync_status(job_id: str = Query(...), current_user=Depends(get_current_user)):
    async_result = celery_app.AsyncResult(job_id)
    state = async_result.state
    result = None
    if async_result.ready():
        result = async_result.result
    return {"job_id": job_id, "state": state, "result": result}
