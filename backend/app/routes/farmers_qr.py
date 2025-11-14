# backend/app/routes/farmers_qr.py (already exists?)
from fastapi import APIRouter, Depends
from app.database import get_database
import qrcode
from io import BytesIO
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/farmers", tags=["QR Codes"])

@router.get("/{farmer_id}/qr")
async def generate_qr(farmer_id: str, db=Depends(get_database)):
    """Generate QR code for farmer."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(farmer_id)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf)
    buf.seek(0)
    
    return StreamingResponse(buf, media_type="image/png")
