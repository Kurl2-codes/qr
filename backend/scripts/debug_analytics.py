import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pprint import pprint

async def debug_analytics():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["qr360"]
    
    print("--- Debugging Analytics Data ---")
    
    # Check one click log
    log = await db.click_logs.find_one()
    print(f"\n--- ID Analysis ---")
    qr_id = log.get("qr_id")
    print(f"Log QR ID: '{qr_id}' (Type: {type(qr_id)})")
    
    qr_check = await db.qr_codes.find_one({"_id": qr_id})
    print(f"Direct Find Result: {'FOUND' if qr_check else 'NOT FOUND'}")
    if qr_check:
        print(f"QR Name: {qr_check.get('name')}")
        print(f"QR Source: {qr_check.get('source')}")

    print("\n--- Aggregation Test ---")
    pipeline = [
        {"$match": {"_id": log["_id"]}},
        {
            "$lookup": {
                "from": "qr_codes",
                "localField": "qr_id",
                "foreignField": "_id",
                "as": "qr_details"
            }
        },
        {"$unwind": {"path": "$qr_details", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": 0,
                "log_qr_id": "$qr_id",
                "joined_name": "$qr_details.name",
                "joined_source": "$qr_details.source"
            }
        }
    ]

    result = await db.click_logs.aggregate(pipeline).to_list(length=1)
    if result:
        print("Aggregation Result:", result[0])
    else:
        print("Aggregation returned EMPTY list")

if __name__ == "__main__":
    asyncio.run(debug_analytics())
