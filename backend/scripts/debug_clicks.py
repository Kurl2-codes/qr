import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Config
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "qr_system"

async def check_click_counts():
    print(f"Connecting to {MONGODB_URL}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    qr_collection = db["qr_codes"]
    clicks_collection = db["click_logs"]
    
    try:
        # 1. Count documents in click_logs (current source of KPI)
        log_count = await clicks_collection.count_documents({})
        print(f"Total Clicks from 'click_logs' count: {log_count}")
        
        # 2. Sum 'clicks' field in all qr_codes (source of Table data)
        pipeline = [
            {"$group": {"_id": None, "total_clicks": {"$sum": "$clicks"}}}
        ]
        cursor = qr_collection.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        qr_sum = result[0]['total_clicks'] if result else 0
        print(f"Total Clicks from sum of 'qr_codes.clicks': {qr_sum}")
        
        # 3. List individual QRs for detail
        print("\nIndividual QR Clicks:")
        async for qr in qr_collection.find({}, {"target_url": 1, "clicks": 1}):
            print(f"- {qr.get('target_url')}: {qr.get('clicks')}")
            
    except Exception as e:
        print(f"Error checking DB: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_click_counts())
