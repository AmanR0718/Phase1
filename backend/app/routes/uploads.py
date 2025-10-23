from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pathlib import Path
from app.database import get_database
from app.dependencies.roles import require_role
import shutil

router = APIRouter(prefix="/api/farmers", tags=["Uploads"])

UPLOAD_ROOT = Path("uploads")
MAX_FILE_SIZE_MB = 5
ALLOWED_PHOTO_TYPES = {"image/jpeg", "image/png"}
ALLOWED_DOC_TYPES = {"image/jpeg", "image/png", "application/pdf"}

async def save_file(file: UploadFile, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

@router.post("/{farmer_id}/upload-photo",
             dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def upload_photo(farmer_id: str, file: UploadFile = File(...),
                       db=Depends(get_database)):
    if file.content_type not in ALLOWED_PHOTO_TYPES:
        raise HTTPException(400, "Invalid photo type")
    if file.size and file.size > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, "File too large")

    filename = f"{farmer_id}_photo{Path(file.filename).suffix}"
    dest = UPLOAD_ROOT / "photos" / farmer_id / filename
    await save_file(file, dest)

    path = f"/uploads/photos/{farmer_id}/{filename}"
    await db.farmers.update_one({"farmer_id": farmer_id},
                                {"$set": {"photo_path": path}})
    return {"message": "Photo uploaded", "photo_path": path}

@router.post("/{farmer_id}/upload-document",
             dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def upload_document(farmer_id: str, document_type: str,
                          file: UploadFile = File(...),
                          db=Depends(get_database)):
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(400, "Invalid document type")

    filename = f"{farmer_id}_{document_type}{Path(file.filename).suffix}"
    dest = UPLOAD_ROOT / "docs" / farmer_id / filename
    await save_file(file, dest)

    path = f"/uploads/docs/{farmer_id}/{filename}"
    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {"$push": {"identification_documents": {
            "doc_type": document_type,
            "file_path": path
        }}})
    return {"message": f"{document_type} uploaded", "path": path}
