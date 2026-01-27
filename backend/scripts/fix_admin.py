import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "qr_system"
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

async def fix_admin():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_collection = db["users"]
    
    admin = await users_collection.find_one({"username": "admin"})
    if admin:
        print("Admin user found. Resetting password...")
        await users_collection.delete_one({"username": "admin"})
    
    print("Creating admin user...")
    admin_user = {
        "username": "admin",
        "hashed_password": pwd_context.hash("password")
    }
    await users_collection.insert_one(admin_user)
    print("Admin user (admin/password) created/reset successfully.")

if __name__ == "__main__":
    asyncio.run(fix_admin())
