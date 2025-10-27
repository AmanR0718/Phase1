from celery import shared_task
from fpdf import FPDF
import qrcode
from datetime import datetime
import os
from PIL import Image
import asyncio
from app.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

UPLOAD_DIR = "/app/uploads/idcards"
QR_DIR = "/app/uploads/qr"

@shared_task(name="app.tasks.id_card_task.generate_id_card")
def generate_id_card(farmer_id: str):
    async def process():
        # ✅ Create Mongo client using same URI & DB as FastAPI
        client = AsyncIOMotorClient(settings.MONGO_URI)
        db = client[settings.MONGO_DB]

        farmer = await db.farmers.find_one({"farmer_id": farmer_id})
        if not farmer:
            print(f"[ERROR] Farmer {farmer_id} not found in DB.")
            client.close()
            return {"error": "Farmer not found"}

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        os.makedirs(QR_DIR, exist_ok=True)

        # --- QR ---
        qr_data = {
            "farmer_id": farmer_id,
            "verified": True,
            "timestamp": datetime.utcnow().isoformat()
        }
        qr_img = qrcode.make(qr_data)
        qr_path = os.path.join(QR_DIR, f"{farmer_id}_qr.png")
        qr_img.save(qr_path)

        # --- Photo ---
        photo_path = farmer.get("photo_path")
        photo_abs = f"/app{photo_path}" if photo_path else None

        # --- PDF card ---
        pdf_path = os.path.join(UPLOAD_DIR, f"{farmer_id}_card.pdf")
        pdf = FPDF("P", "mm", (90, 60))
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 14)
        pdf.cell(0, 10, "Farmer ID Card", ln=True, align="C")

        # --- Photo embed or placeholder ---
        if photo_abs and os.path.exists(photo_abs):
            try:
                pdf.image(photo_abs, x=5, y=20, w=25, h=25)
            except Exception as e:
                print(f"[WARN] Could not embed photo: {e}")
                pdf.set_fill_color(200, 200, 200)
                pdf.rect(5, 20, 25, 25, style="F")
                pdf.set_font("Helvetica", "I", 8)
                pdf.text(8, 35, "No Photo")
        else:
            pdf.set_fill_color(200, 200, 200)
            pdf.rect(5, 20, 25, 25, style="F")
            pdf.set_font("Helvetica", "I", 8)
            pdf.text(8, 35, "No Photo")

        pdf.image(qr_path, x=60, y=20, w=25, h=25)

        name = f"{farmer['personal_info']['first_name']} {farmer['personal_info']['last_name']}"
        pdf.set_xy(5, 50)
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 5, f"Name: {name}\nID: {farmer_id}", align="L")

        pdf.output(pdf_path)

        # ✅ Update DB with ID card path
        await db.farmers.update_one(
            {"farmer_id": farmer_id},
            {"$set": {"id_card_path": pdf_path}}
        )

        client.close()
        return {"message": "ID card generated", "id_card_path": pdf_path}

    return asyncio.run(process())
