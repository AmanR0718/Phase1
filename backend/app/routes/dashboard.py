from fastapi import APIRouter, Depends
from app.database import get_database
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(
    db=Depends(get_database),
    current_user=Depends(get_current_user)
):
    total_farmers = await db.farmers.count_documents({})
    active_farmers = await db.farmers.count_documents({"status": "active"})
    total_users = await db.users.count_documents({})
    recent_farmers = await db.farmers.find({}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_farmers": total_farmers,
        "active_farmers": active_farmers,
        "total_users": total_users,
        "recent_farmers": recent_farmers
    }
