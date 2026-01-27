import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "qr_system"

async def check_user():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_collection = db["users"]
    
    admin = await users_collection.find_one({"username": "admin"})
    if admin:
        print(f"User: {admin['username']}")
        print(f"Hash: {admin['hashed_password']}")
    else:
        print("Admin not found")

if __name__ == "__main__":
    asyncio.run(check_user())
