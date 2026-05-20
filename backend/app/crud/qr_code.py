from datetime import datetime, timezone
import uuid
from typing import List, Optional
from app.core.database import qr_collection, clicks_collection
from app.schemas.qr_code import QRCodeCreate
from app.core.config import settings

async def get_multi(skip: int = 0, limit: int = 100) -> List[dict]:
    cursor = qr_collection.find().sort("created_at", -1).skip(skip).limit(limit)
    qrs = await cursor.to_list(length=limit)
    # Patch old records if needed and fix proxy_url to point directly to backend
    for qr in qrs:
        if "source" not in qr: qr["source"] = qr.get("category", "General")
        if "qr_type" not in qr: qr["qr_type"] = "url"
        if "fg_color" not in qr: qr["fg_color"] = "#0b0f19"
        if "bg_color" not in qr: qr["bg_color"] = "#ffffff"
        if "include_margin" not in qr: qr["include_margin"] = False
        if "border_radius" not in qr: qr["border_radius"] = 12
        if "border_width" not in qr: qr["border_width"] = 0
        if "border_color" not in qr: qr["border_color"] = "#3b82f6"
        if "shadow" not in qr: qr["shadow"] = "none"
        if "is_gradient" not in qr: qr["is_gradient"] = False
        if "fg_color_start" not in qr: qr["fg_color_start"] = qr.get("fg_color", "#0b0f19")
        if "fg_color_end" not in qr: qr["fg_color_end"] = qr.get("fg_color", "#0b0f19")
        
        qr_id = qr["_id"]
        qr["proxy_url"] = f"{settings.PROXY_BASE_URL}{qr_id}"
             
    return qrs

async def get(qr_id: str) -> Optional[dict]:
    qr = await qr_collection.find_one({"_id": qr_id})
    if qr:
        qr["proxy_url"] = f"{settings.PROXY_BASE_URL}{qr_id}"
        if "fg_color" not in qr: qr["fg_color"] = "#0b0f19"
        if "bg_color" not in qr: qr["bg_color"] = "#ffffff"
        if "include_margin" not in qr: qr["include_margin"] = False
        if "border_radius" not in qr: qr["border_radius"] = 12
        if "border_width" not in qr: qr["border_width"] = 0
        if "border_color" not in qr: qr["border_color"] = "#3b82f6"
        if "shadow" not in qr: qr["shadow"] = "none"
        if "is_gradient" not in qr: qr["is_gradient"] = False
        if "fg_color_start" not in qr: qr["fg_color_start"] = qr.get("fg_color", "#0b0f19")
        if "fg_color_end" not in qr: qr["fg_color_end"] = qr.get("fg_color", "#0b0f19")
    return qr

async def create(obj_in: QRCodeCreate) -> dict:
    qr_id = str(uuid.uuid4())[:8]
    now = datetime.now(timezone.utc)
    # Use PROXY_BASE_URL (pointing directly to backend redirect handler)
    proxy_url = f"{settings.PROXY_BASE_URL}{qr_id}"
    
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
        "fg_color": obj_in.fg_color,
        "bg_color": obj_in.bg_color,
        "include_margin": obj_in.include_margin,
        "border_radius": obj_in.border_radius,
        "border_width": obj_in.border_width,
        "border_color": obj_in.border_color,
        "shadow": obj_in.shadow,
        "is_gradient": obj_in.is_gradient,
        "fg_color_start": obj_in.fg_color_start,
        "fg_color_end": obj_in.fg_color_end,
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
