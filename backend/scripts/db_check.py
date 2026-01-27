import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta

async def check_logs():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["qr360"]
    clicks_collection = db["click_logs"]
    
    count = await clicks_collection.count_documents({})
    print(f"Total clicks in database: {count}")
    
    recent = await clicks_collection.find().sort("timestamp", -1).limit(5).to_list(length=5)
    for r in recent:
        print(f"Log ID: {r['_id']}")
        for k, v in r.items():
            if k != '_id': print(f"  {k}: {v}")
        
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    count_recent = await clicks_collection.count_documents({"timestamp": {"$gte": seven_days_ago}})
    print(f"Clicks in last 7 days: {count_recent}")

if __name__ == "__main__":
    asyncio.run(check_logs())
