from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
db = client[settings.DATABASE_NAME]

def get_db():
    return db

# Collections
qr_collection = db["qr_codes"]
users_collection = db["users"]
clicks_collection = db["click_logs"]
