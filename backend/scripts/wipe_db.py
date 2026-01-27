import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "qr_system"

async def wipe_qrs():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    # Only wipe QR codes, keep users
    await db["qr_codes"].delete_many({})
    print("QR codes collection wiped.")

if __name__ == "__main__":
    asyncio.run(wipe_qrs())
