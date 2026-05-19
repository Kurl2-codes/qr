from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List
import uuid
import shutil
import os
from app.crud import qr_code as qr_crud
from app.schemas.qr_code import QRCode, QRCodeCreate
from app.api.deps import get_current_user
from app.core.config import settings
import csv
import io
from datetime import datetime, timezone
from app.core.logging_config import logger
from app.core.database import qr_collection

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

@router.post("/bulk-vcard")
async def bulk_create_vcard(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    """Bulk create dynamic QR code campaigns from a CSV file."""


    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV")
        
    try:
        contents = await file.read()
        decoded = contents.decode("utf-8-sig")
        csv_file = io.StringIO(decoded)
        reader = csv.DictReader(csv_file)
        
        headers = reader.fieldnames
        if not headers:
            raise HTTPException(status_code=400, detail="CSV file is empty or invalid")
            
        headers_cleaned = [h.strip() for h in headers]
        header_map = {h: h.strip() for h in headers}
        
        required_headers = ["QR Code Name", "First Name", "Last Name"]
        for req in required_headers:
            if req not in headers_cleaned:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Missing required CSV column: {req}"
                )
                
        qrs_to_create = []
        errors = []
        import re
        
        for idx, row in enumerate(reader, start=2):
            if not row:
                continue
                
            # Safely clean row items to prevent AttributeError: 'list' object has no attribute 'strip'
            row_cleaned = {}
            for k, v in row.items():
                if k is None:
                    continue  # Skip extra unnamed columns
                cleaned_key = header_map.get(k, k)
                if isinstance(v, list):
                    row_cleaned[cleaned_key] = " ".join([item.strip() for item in v if isinstance(item, str)])
                elif isinstance(v, str):
                    row_cleaned[cleaned_key] = v.strip()
                else:
                    row_cleaned[cleaned_key] = ""
            
            # Skip completely empty rows
            if not any(row_cleaned.values()):
                continue
                
            qr_name = row_cleaned.get("QR Code Name", "")
            first_name = row_cleaned.get("First Name", "")
            last_name = row_cleaned.get("Last Name", "")
            location = row_cleaned.get("Location", "")
            phone_1 = row_cleaned.get("Phone 1", "")
            email = row_cleaned.get("Email", "")
            organization = row_cleaned.get("Organization", "")
            title = row_cleaned.get("Title", "")
            
            row_errors = []
            
            # Validation Rules
            if not qr_name:
                row_errors.append("Missing 'QR Code Name'")
            if not first_name:
                row_errors.append("Missing 'First Name'")
            if not last_name:
                row_errors.append("Missing 'Last Name'")
            if not phone_1:
                row_errors.append("Missing 'Phone 1'")
            if not email:
                row_errors.append("Missing 'Email'")
            elif not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
                row_errors.append(f"Invalid Email format ('{email}')")
                
            if row_errors:
                who = f"{first_name} {last_name}".strip()
                who_desc = f" ({who})" if who else (f" (Campaign: {qr_name})" if qr_name else "")
                errors.append(f"Row {idx}{who_desc}: {', '.join(row_errors)}")
                continue
                
            # If we already encountered errors on previous rows, we still validate the rest, 
            # but we don't need to build the DB objects
            if errors:
                continue
                
            # Parse all phone numbers dynamically (Phone 1, Phone 2, Phone 3, etc.)
            phones = []
            phone_idx = 1
            while True:
                phone_key = f"Phone {phone_idx}"
                if phone_key in row_cleaned:
                    val = row_cleaned[phone_key]
                    if val:
                        phone_type = row_cleaned.get(f"{phone_key} Type", "Mobile Phone" if phone_idx == 1 else "Work")
                        phones.append({"type": phone_type, "number": val})
                    phone_idx += 1
                else:
                    break
                
            # Parse all websites dynamically (Website 1 URL, Website 1 Label, Website 2 URL, etc.)
            websites = []
            web_idx = 1
            while True:
                url_key = f"Website {web_idx} URL"
                label_key = f"Website {web_idx} Label"
                if url_key in row_cleaned or label_key in row_cleaned:
                    web_url = row_cleaned.get(url_key, "")
                    web_label = row_cleaned.get(label_key, "")
                    if web_url:
                        websites.append({"label": web_label or f"Website {web_idx}", "url": web_url})
                    web_idx += 1
                else:
                    break
                
            primary_website = websites[0]["url"] if websites else None
            
            vcard_data = {
                "first_name": first_name,
                "last_name": last_name,
                "location": location if location else None,
                "phone": phone_1 if phone_1 else None,
                "phones": phones,
                "email": email if email else None,
                "organization": organization if organization else None,
                "job_title": title if title else None,
                "website": primary_website,
                "websites": websites
            }
            
            qr_id = str(uuid.uuid4())[:8]
            now = datetime.now(timezone.utc)
            proxy_url = f"{settings.PROXY_BASE_URL}{qr_id}"
            
            db_qr = {
                "_id": qr_id,
                "name": qr_name,
                "proxy_url": proxy_url,
                "target_url": "",
                "is_active": True,
                "source": "Bulk Import",
                "qr_type": "vcard",
                "vcard_data": vcard_data,
                "logo_image": None,
                "clicks": 0,
                "created_at": now,
                "updated_at": now
            }
            qrs_to_create.append(db_qr)
            
        if errors:
            raise HTTPException(
                status_code=400,
                detail=f"CSV Validation Failed! No campaigns were created. Details: {'; '.join(errors)}"
            )
            
        if not qrs_to_create:
            return {"success": True, "count": 0, "message": "No valid records to import"}
            
        await qr_collection.insert_many(qrs_to_create)
        
        return {
            "success": True, 
            "count": len(qrs_to_create), 
            "message": f"Successfully imported {len(qrs_to_create)} vCard campaigns in bulk."
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during bulk vCard import: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

