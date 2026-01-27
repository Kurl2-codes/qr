import asyncio
import motor.motor_asyncio

async def cleanup():
    client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['qr_system']
    qrs = db['qr_codes']
    logs = db['click_logs']
    
    # Get all valid QR IDs
    valid_ids = await qrs.distinct("_id")
    
    # Delete logs that are NOT in the valid_ids list
    result = await logs.delete_many({"qr_id": {"$nin": valid_ids}})
    print(f"Cleaned up {result.deleted_count} orphaned scan logs.")
    
    # Also reset click counts for safety (though not strictly asked, helps match)
    # Actually, let's just stick to the deletion sync.

if __name__ == "__main__":
    asyncio.run(cleanup())
