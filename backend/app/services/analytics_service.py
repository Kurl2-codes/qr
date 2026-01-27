from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from user_agents import parse
from app.core.database import clicks_collection, qr_collection
from app.schemas.analytics import AnalyticsOverview

async def log_click(qr_id: str, user_agent: str, source: str = "General"):
    parsed_ua = parse(user_agent) if user_agent else None
    
    device_brand = parsed_ua.device.brand if parsed_ua else "Unknown"
    device_model = parsed_ua.device.model if parsed_ua else "Unknown"
    
    if not device_brand or device_brand == "None":
        if parsed_ua and parsed_ua.is_pc:
            device_brand = "Desktop"
            device_model = parsed_ua.os.family
        else:
            device_brand = "Unknown"
            device_model = "Unknown"

    log_entry = {
        "qr_id": qr_id,
        "timestamp": datetime.now(timezone.utc),
        "user_agent": user_agent,
        "browser": parsed_ua.browser.family if parsed_ua else "Unknown",
        "browser_version": parsed_ua.browser.version_string if parsed_ua else "",
        "os": parsed_ua.os.family if parsed_ua else "Unknown",
        "os_version": parsed_ua.os.version_string if parsed_ua else "",
        "device_brand": device_brand,
        "device_model": device_model,
        "device_type": "Mobile" if parsed_ua and parsed_ua.is_mobile else "Tablet" if parsed_ua and parsed_ua.is_tablet else "PC" if parsed_ua and parsed_ua.is_pc else "Bot" if parsed_ua and parsed_ua.is_bot else "Unknown",
        "source": source
    }
    await clicks_collection.insert_one(log_entry)
    await qr_collection.update_one({"_id": qr_id}, {"$inc": {"clicks": 1}})

async def get_overview() -> Dict[str, Any]:
    valid_qrs = await qr_collection.distinct("_id")
    
    pipeline_total = [
        {"$match": {"_id": {"$in": valid_qrs}}},
        {"$group": {"_id": None, "total": {"$sum": "$clicks"}}}
    ]
    total_clicks_cursor = qr_collection.aggregate(pipeline_total)
    total_clicks_result = await total_clicks_cursor.to_list(length=1)
    total_clicks = total_clicks_result[0]["total"] if total_clicks_result else 0
    
    total_qrs = len(valid_qrs)
    active_links = await qr_collection.count_documents({"is_active": True})
    
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    pipeline = [
        {"$match": {
            "timestamp": {"$gte": seven_days_ago},
            "qr_id": {"$in": valid_qrs}
        }},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    daily_clicks = await clicks_collection.aggregate(pipeline).to_list(length=7)
    
    cursor = qr_collection.find().sort([("clicks", -1), ("created_at", -1)])
    top_qrs = await cursor.to_list(length=100)
    
    # Standardize IDs for Pydantic
    for qr in top_qrs:
        qr["id"] = qr["_id"]

    device_type_pipeline = [{"$match": {"qr_id": {"$in": valid_qrs}}}, {"$group": {"_id": "$device_type", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}]
    device_types = await clicks_collection.aggregate(device_type_pipeline).to_list(length=10)

    os_pipeline = [{"$match": {"qr_id": {"$in": valid_qrs}}}, {"$group": {"_id": "$os", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 5}]
    os_stats = await clicks_collection.aggregate(os_pipeline).to_list(length=5)

    browser_pipeline = [{"$match": {"qr_id": {"$in": valid_qrs}}}, {"$group": {"_id": "$browser", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 5}]
    browser_stats = await clicks_collection.aggregate(browser_pipeline).to_list(length=5)

    model_pipeline = [{"$match": {"qr_id": {"$in": valid_qrs}}}, {"$group": {"_id": "$device_model", "count": {"$sum": 1}}}, {"$sort": {"count": -1}}, {"$limit": 5}]
    model_stats = await clicks_collection.aggregate(model_pipeline).to_list(length=5)

    recent_scans_pipeline = [
        {"$sort": {"timestamp": -1}},
        {"$limit": 100},
        {
            "$lookup": {
                "from": "qr_codes",
                "localField": "qr_id",
                "foreignField": "_id",
                "as": "qr_details"
            }
        },
        {
            "$addFields": {
                "qr_name": {"$ifNull": [{"$arrayElemAt": ["$qr_details.name", 0]}, "Unknown"]},
                "source": {"$ifNull": [{"$arrayElemAt": ["$qr_details.source", 0]}, "$source"]}
            }
        },
        {"$project": {"qr_details": 0}}
    ]
    recent_scans = await clicks_collection.aggregate(recent_scans_pipeline).to_list(length=100)

    for scan in recent_scans:
        scan["_id"] = str(scan["_id"])
        ts = scan["timestamp"]
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        scan["timestamp"] = ts

    return {
        "total_clicks": total_clicks,
        "total_qrs": total_qrs,
        "active_links": active_links,
        "daily_clicks": daily_clicks,
        "top_qrs": top_qrs,
        "device_stats": device_types,
        "os_stats": os_stats,
        "browser_stats": browser_stats,
        "model_stats": model_stats,
        "recent_scans": recent_scans
    }
