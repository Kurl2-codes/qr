from datetime import datetime, timezone
import uuid
from typing import List, Optional
from app.core.database import qr_collection, clicks_collection
from app.schemas.qr_code import QRCodeCreate
from app.core.config import settings

async def get_multi(skip: int = 0, limit: int = 100) -> List[dict]:
    cursor = qr_collection.find().sort("created_at", -1).skip(skip).limit(limit)
    qrs = await cursor.to_list(length=limit)
    # Patch old records if needed and fix proxy_url
    for qr in qrs:
        if "source" not in qr: qr["source"] = qr.get("category", "General")
        if "qr_type" not in qr: qr["qr_type"] = "url"
        
        # Ensure proxy_url uses FRONTEND_URL
        if "proxy_url" in qr and qr["proxy_url"]:
             # If it starts with backend URL or old proxy base, replace it
             qr["proxy_url"] = qr["proxy_url"].replace(settings.PROXY_BASE_URL, f"{settings.FRONTEND_URL}/q/")
             # Also handle if it was stored as backend:8001
             # We can just force it to be consistent
             qr_id = qr["_id"]
             qr["proxy_url"] = f"{settings.FRONTEND_URL}/q/{qr_id}"
             
    return qrs

async def get(qr_id: str) -> Optional[dict]:
    qr = await qr_collection.find_one({"_id": qr_id})
    if qr:
        # Ensure proxy_url uses FRONTEND_URL
        if "proxy_url" in qr:
            qr["proxy_url"] = f"{settings.FRONTEND_URL}/q/{qr_id}"
    return qr

async def create(obj_in: QRCodeCreate) -> dict:
    qr_id = str(uuid.uuid4())[:8]
    now = datetime.now(timezone.utc)
    # Use FRONTEND_URL for proxy_url (settings.PROXY_BASE_URL is now frontend url in docker, but let's be explicit)
    # Actually, settings.PROXY_BASE_URL might still be backend in local dev if not updated in .env
    # But we want to store the URL that user should visit.
    # docker-compose sets PROXY_BASE_URL to frontend.
    # So using settings.PROXY_BASE_URL is correct if env is correct.
    # However, for robustness, let's use FRONTEND_URL + /q/
    proxy_url = f"{settings.FRONTEND_URL}/q/{qr_id}"
    
    db_qr = {
        "_id": qr_id,
        "name": obj_in.name,
        "proxy_url": proxy_url,
        "target_url": obj_in.target_url,
        "is_active": obj_in.is_active,
        "source": obj_in.source,
        "qr_type": obj_in.qr_type,
        "vcard_data": obj_in.vcard_data.dict() if obj_in.vcard_data else None,
        "logo_image": obj_in.logo_image,
        "clicks": 0,
        "created_at": now,
        "updated_at": now
    }
    await qr_collection.insert_one(db_qr)
    return db_qr

async def update(qr_id: str, obj_in: QRCodeCreate) -> Optional[dict]:
    now = datetime.now(timezone.utc)
    update_data = obj_in.dict(exclude_unset=True)
    if "vcard_data" in update_data and update_data["vcard_data"]:
        update_data["vcard_data"] = obj_in.vcard_data.dict()
    update_data["updated_at"] = now
    
    result = await qr_collection.find_one_and_update(
        {"_id": qr_id},
        {"$set": update_data},
        return_document=True
    )
    return result

async def delete(qr_id: str) -> bool:
    result = await qr_collection.delete_one({"_id": qr_id})
    if result.deleted_count > 0:
        await clicks_collection.delete_many({"qr_id": qr_id})
        return True
    return False
