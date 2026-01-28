import asyncio
from app.core.database import qr_collection

async def wipe_qrs():
    result = await qr_collection.delete_many({})
    print(f"Successfully deleted {result.deleted_count} QR codes.")

if __name__ == "__main__":
    asyncio.run(wipe_qrs())
