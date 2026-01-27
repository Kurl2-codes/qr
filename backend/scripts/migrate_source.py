import asyncio
import motor.motor_asyncio

async def migrate():
    client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['qr_system']
    collection = db['qr_codes']
    
    # Rename category field to source for all documents
    result = await collection.update_many(
        {"category": {"$exists": True}},
        {"$rename": {"category": "source"}}
    )
    print(f"Renamed {result.modified_count} fields from category to source")
            
    print("Migration complete")

if __name__ == "__main__":
    asyncio.run(migrate())
