from .celery_app import celery_app
import os
from pymongo import MongoClient, UpdateOne
from datetime import datetime
from ..services.farmer_service import FarmerService

MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "zambian_farmer_db")

def get_db_sync():
    client = MongoClient(MONGO_URI)
    return client[MONGO_DB]

@celery_app.task(bind=True)
def process_sync_batch(self, user_email, records):
    """
    records: list of farmer dicts (each contains temp_id optional, farmer fields)
    returns: { "job_id": ..., "results": [ { temp_id, farmer_id, status, errors } ] }
    """
    db = get_db_sync()
    out_results = []
    bulk_ops = []
    now = datetime.utcnow()

    users_coll = db.users
    farmers_coll = db.farmers

    for rec in records:
        temp_id = rec.get("temp_id")
        try:
            # validate fields (throws HTTPException-like? we'll capture generically)
            FarmerService.validate_farmer_data(rec)
            # encrypt sensitive fields
            rec = FarmerService.encrypt_sensitive_fields(rec)
        except Exception as e:
            out_results.append({
                "temp_id": temp_id,
                "farmer_id": None,
                "status": "error",
                "errors": [str(e)]
            })
            continue

        # Deduplication logic:
        # priority 1: temp_id (if server has a record with this temp_id)
        # priority 2: nrc_hash (if present)
        # priority 3: phone_primary
        query = {}
        if temp_id:
            query = {"temp_id": temp_id}
        elif rec.get("nrc_hash"):
            query = {"nrc_hash": rec["nrc_hash"]}
        elif rec.get("personal_info", {}).get("phone_primary"):
            query = {"personal_info.phone_primary": rec["personal_info"]["phone_primary"]}

        if query:
            existing = farmers_coll.find_one(query)
        else:
            existing = None

        if existing:
            # update existing
            rec["updated_at"] = now
            rec["last_modified_by"] = user_email
            farmers_coll.update_one({"_id": existing["_id"]}, {"$set": rec})
            out_results.append({
                "temp_id": temp_id,
                "farmer_id": existing.get("farmer_id"),
                "status": "updated",
                "errors": []
            })
        else:
            # create a new farmer_id if not present (generate simple id)
            import uuid
            rec["farmer_id"] = rec.get("farmer_id") or ("ZM" + uuid.uuid4().hex[:8].upper())
            rec["created_at"] = now
            rec["created_by"] = user_email
            farmers_coll.insert_one(rec)
            out_results.append({
                "temp_id": temp_id,
                "farmer_id": rec["farmer_id"],
                "status": "created",
                "errors": []
            })

    return {"job_id": self.request.id, "results": out_results}
