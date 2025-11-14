# backend/app/routes/uploads.py - COMPLETE VERSION
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pathlib import Path
from app.database import get_database
from app.dependencies.roles import require_role
import shutil
import os
from datetime import datetime

router = APIRouter(prefix="/api/farmers", tags=["Uploads"])

UPLOAD_ROOT = Path("uploads")
MAX_FILE_SIZE_MB = 10
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png", "image/jpg"}
ALLOWED_DOC_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}

def create_farmer_folder(farmer_id: str):
    """Create organized folder structure for each farmer."""
    base_path = UPLOAD_ROOT / farmer_id
    folders = {
        "photos": base_path / "photos",
        "documents": base_path / "documents",
        "idcards": base_path / "idcards",
        "qr": base_path / "qr"
    }
    
    for folder in folders.values():
        folder.mkdir(parents=True, exist_ok=True)
    
    return folders

async def save_file(file: UploadFile, dest: Path):
    """Save uploaded file to destination."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

@router.post("/{farmer_id}/upload-photo",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def upload_photo(
    farmer_id: str, 
    file: UploadFile = File(...),
    db=Depends(get_database)
):
    """Upload farmer photo to organized folder."""
    # Verify farmer exists
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(404, "Farmer not found")
    
    # Validate file type
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(400, f"Invalid photo type. Allowed: {ALLOWED_PHOTO_TYPES}")
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start
    
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max size: {MAX_FILE_SIZE_MB}MB")
    
    # Create folder structure
    folders = create_farmer_folder(farmer_id)
    
    # Save file
    ext = Path(file.filename).suffix
    filename = f"{farmer_id}_photo{ext}"
    dest = folders["photos"] / filename
    await save_file(file, dest)
    
    # Update database
    relative_path = f"/uploads/{farmer_id}/photos/{filename}"
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {
            "$set": {
                "photo_path": relative_path,
                "photo_uploaded_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Photo uploaded successfully",
        "photo_path": relative_path,
        "farmer_id": farmer_id
    }

@router.post("/{farmer_id}/upload-document",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def upload_document(
    farmer_id: str,
    document_type: str,  # e.g., "nrc", "land_title", "license"
    file: UploadFile = File(...),
    db=Depends(get_database)
):
    """Upload farmer document (NRC, Land Title, etc.)."""
    # Verify farmer exists
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(404, "Farmer not found")
    
    # Validate file type
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(400, f"Invalid document type. Allowed: {ALLOWED_DOC_TYPES}")
    
    # Validate document type
    valid_doc_types = ["nrc", "land_title", "license", "certificate", "other"]
    if document_type not in valid_doc_types:
        raise HTTPException(400, f"Invalid document_type. Use one of: {valid_doc_types}")
    
    # Check file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File too large. Max size: {MAX_FILE_SIZE_MB}MB")
    
    # Create folder structure
    folders = create_farmer_folder(farmer_id)
    
    # Save file
    ext = Path(file.filename).suffix
    filename = f"{farmer_id}_{document_type}{ext}"
    dest = folders["documents"] / filename
    await save_file(file, dest)
    
    # Update database
    relative_path = f"/uploads/{farmer_id}/documents/{filename}"
    
    document_entry = {
        "doc_type": document_type,
        "file_path": relative_path,
        "uploaded_at": datetime.utcnow(),
        "filename": filename
    }
    
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {
            "$push": {"identification_documents": document_entry}
        }
    )
    
    return {
        "message": f"{document_type} uploaded successfully",
        "path": relative_path,
        "document_type": document_type,
        "farmer_id": farmer_id
    }

@router.get("/{farmer_id}/files")
async def list_farmer_files(
    farmer_id: str,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))
):
    """List all files for a farmer."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(404, "Farmer not found")
    
    farmer_folder = UPLOAD_ROOT / farmer_id
    
    files = {
        "photo": farmer.get("photo_path"),
        "documents": farmer.get("identification_documents", []),
        "id_card": farmer.get("id_card_path"),
        "qr_code": farmer.get("qr_code_path"),
        "folder_path": str(farmer_folder)
    }
    
    return files

@router.delete("/{farmer_id}/delete-photo")
async def delete_photo(
    farmer_id: str,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR"]))
):
    """Delete farmer photo."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer or not farmer.get("photo_path"):
        raise HTTPException(404, "Photo not found")
    
    # Delete file from disk
    photo_path = Path(farmer["photo_path"].lstrip("/"))
    if photo_path.exists():
        photo_path.unlink()
    
    # Update database
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {
            "$unset": {"photo_path": "", "photo_uploaded_at": ""}
        }
    )
    
    return {"message": "Photo deleted successfully"}

@router.delete("/{farmer_id}/delete-document/{doc_type}")
async def delete_document(
    farmer_id: str,
    doc_type: str,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR"]))
):
    """Delete specific document."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(404, "Farmer not found")
    
    docs = farmer.get("identification_documents", [])
    doc_to_delete = None
    
    for doc in docs:
        if doc["doc_type"] == doc_type:
            doc_to_delete = doc
            break
    
    if not doc_to_delete:
        raise HTTPException(404, "Document not found")
    
    # Delete file from disk
    doc_path = Path(doc_to_delete["file_path"].lstrip("/"))
    if doc_path.exists():
        doc_path.unlink()
    
    # Update database
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {
            "$pull": {"identification_documents": {"doc_type": doc_type}}
        }
    )
    
    return {"message": f"{doc_type} deleted successfully"}