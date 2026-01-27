from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List
import uuid
import shutil
import os
from app.crud import qr_code as qr_crud
from app.schemas.qr_code import QRCode, QRCodeCreate
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()

@router.get("/", response_model=List[QRCode])
async def list_qrs(skip: int = 0, limit: int = 100, current_user = Depends(get_current_user)):
    """Retrieve all QR codes available in the system."""
    return await qr_crud.get_multi(skip=skip, limit=limit)

@router.post("/", response_model=QRCode)
async def create_qr(qr_in: QRCodeCreate, current_user = Depends(get_current_user)):
    """Create a new dynamic QR code campaign."""
    return await qr_crud.create(qr_in)

@router.patch("/{qr_id}", response_model=QRCode)
async def update_qr(qr_id: str, qr_in: QRCodeCreate, current_user = Depends(get_current_user)):
    """Update an existing QR code's destination or status."""
    result = await qr_crud.update(qr_id, qr_in)
    if not result:
        raise HTTPException(status_code=404, detail="QR Code not found")
    return result

@router.delete("/{qr_id}")
async def delete_qr(qr_id: str, current_user = Depends(get_current_user)):
    """Permanently delete a QR code and its associated analytics."""
    success = await qr_crud.delete(qr_id)
    if not success:
        raise HTTPException(status_code=404, detail="QR Code not found")
    return {"message": "QR Code and analytics deleted successfully"}

@router.post("/upload")
async def upload_image(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Upload a logo image for QR codes."""
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ['png', 'jpg', 'jpeg', 'gif', 'svg']:
        raise HTTPException(status_code=400, detail="Invalid image format")
        
    filename = f"{uuid.uuid4()}.{file_ext}"
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR)
        
    file_location = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Using relative path for the URL to avoid hardcoding localhost
    return {"url": f"/{settings.UPLOAD_DIR}/{filename}"}
