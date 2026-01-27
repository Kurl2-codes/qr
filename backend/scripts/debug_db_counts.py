import asyncio
from motor.motor_asyncio import AsyncIOMotorClient


# Config
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "qr_system"

async def check_db_counts():
    print(f"Connecting to {MONGODB_URL}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    collection = db["qr_codes"]
    
    print("Checking 'qr_codes' collection...")
    try:
        count = await collection.count_documents({})
        print(f"Total QR Codes (count_documents{{}}): {count}")
        
        # Double check with len(find)
        cursor = collection.find({})
        docs = await cursor.to_list(length=1000)
        print(f"Total QR Codes (find().to_list()): {len(docs)}")
        
        active_count = await collection.count_documents({"is_active": True})
        print(f"Active Links (count_documents{{'is_active': True}}): {active_count}")
        
        # Check first doc to see structure
        if docs:
            print(f"First doc sample: {docs[0]}")
            
    except Exception as e:
        print(f"Error checking DB: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_db_counts())
