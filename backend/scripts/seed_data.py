import asyncio
from datetime import datetime
import uuid
from app.core.database import qr_collection

async def seed_data():
    example_qr_codes = [
        {
            "_id": str(uuid.uuid4()),
            "name": "Google Search",
            "target_url": "https://www.google.com",
            "proxy_url": "http://localhost:8001/q/google-search",
            "is_active": True,
            "source": "General",
            "qr_type": "url",
            "clicks": 15,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Company Website",
            "target_url": "https://www.example.com",
            "proxy_url": "http://localhost:8001/q/company-web",
            "is_active": True,
            "source": "Marketing",
            "qr_type": "url",
            "clicks": 42,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": str(uuid.uuid4()),
            "name": "Support WhatsApp",
            "target_url": "https://wa.me/1234567890",
            "proxy_url": "http://localhost:8001/q/support-wa",
            "is_active": True,
            "source": "Support",
            "qr_type": "url",
            "clicks": 8,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Check if data already exists
    count = await qr_collection.count_documents({})
    if count == 0:
        await qr_collection.insert_many(example_qr_codes)
        print(f"Successfully seeded {len(example_qr_codes)} QR codes.")
    else:
        print(f"Database already has {count} QR codes. No seeding needed.")

if __name__ == "__main__":
    asyncio.run(seed_data())
