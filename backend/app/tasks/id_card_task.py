# backend/app/tasks/id_card_task.py
"""Background task for ID card generation with QR code."""
import os
import qrcode
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from app.config import settings
from app.database import get_database
from datetime import datetime

# ID Card dimensions (credit card size)
CARD_WIDTH = 85.6 * mm
CARD_HEIGHT = 53.98 * mm

async def generate_id_card(farmer: dict):
    """Generate PDF ID card with QR code for a farmer."""
    try:
        farmer_id = farmer.get("farmer_id")
        
        # Create folders
        idcard_folder = os.path.join(settings.UPLOAD_DIR, "idcards")
        qr_folder = os.path.join(settings.UPLOAD_DIR, "qr")
        os.makedirs(idcard_folder, exist_ok=True)
        os.makedirs(qr_folder, exist_ok=True)
        
        # Generate QR Code
        qr_data = f"FARMER_ID:{farmer_id}"
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Save QR image
        qr_path = os.path.join(qr_folder, f"{farmer_id}_qr.png")
        qr_img.save(qr_path)
        
        # Create PDF
        pdf_path = os.path.join(idcard_folder, f"{farmer_id}_card.pdf")
        c = canvas.Canvas(pdf_path, pagesize=A4)
        
        # Card position (centered on A4)
        x_offset = (A4[0] - CARD_WIDTH) / 2
        y_offset = (A4[1] - CARD_HEIGHT) / 2
        
        # Draw card border
        c.setStrokeColorRGB(0.1, 0.54, 0.28)  # Green
        c.setLineWidth(2)
        c.rect(x_offset, y_offset, CARD_WIDTH, CARD_HEIGHT)
        
        # Header background (green)
        c.setFillColorRGB(0.1, 0.54, 0.28)
        c.rect(x_offset, y_offset + CARD_HEIGHT - 20*mm, CARD_WIDTH, 20*mm, fill=1, stroke=0)
        
        # Title
        c.setFillColorRGB(1, 1, 1)  # White text
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(
            x_offset + CARD_WIDTH/2, 
            y_offset + CARD_HEIGHT - 10*mm, 
            "ZAMBIAN FARMER ID"
        )
        
        # Personal info section
        c.setFillColorRGB(0, 0, 0)  # Black text
        y_text = y_offset + CARD_HEIGHT - 30*mm
        
        # Name
        c.setFont("Helvetica-Bold", 12)
        name = f"{farmer.get('personal_info', {}).get('first_name', '')} {farmer.get('personal_info', {}).get('last_name', '')}"
        c.drawString(x_offset + 5*mm, y_text, f"Name: {name}")
        
        # Farmer ID
        y_text -= 6*mm
        c.setFont("Helvetica", 10)
        c.drawString(x_offset + 5*mm, y_text, f"ID: {farmer_id}")
        
        # Phone
        y_text -= 5*mm
        phone = farmer.get('personal_info', {}).get('phone_primary', 'N/A')
        c.drawString(x_offset + 5*mm, y_text, f"Phone: {phone}")
        
        # Location
        y_text -= 5*mm
        district = farmer.get('address', {}).get('district', 'N/A')
        province = farmer.get('address', {}).get('province', 'N/A')
        c.drawString(x_offset + 5*mm, y_text, f"Location: {district}, {province}")
        
        # Add QR Code
        qr_size = 35*mm
        c.drawImage(
            qr_path,
            x_offset + CARD_WIDTH - qr_size - 5*mm,
            y_offset + 5*mm,
            width=qr_size,
            height=qr_size,
            preserveAspectRatio=True
        )
        
        # Footer
        c.setFont("Helvetica", 7)
        c.drawCentredString(
            x_offset + CARD_WIDTH/2,
            y_offset + 3*mm,
            f"Issued: {datetime.utcnow().strftime('%Y-%m-%d')}"
        )
        
        c.save()
        
        # Update database with paths
        db = get_database()
        await db.farmers.update_one(
            {"farmer_id": farmer_id},
            {
                "$set": {
                    "id_card_path": pdf_path.replace("/app", ""),
                    "qr_code_path": qr_path.replace("/app", "")
                }
            }
        )
        
        print(f"✅ ID card generated for {farmer_id}")
        return pdf_path
        
    except Exception as e:
        print(f"❌ ID card generation failed: {e}")
        raise