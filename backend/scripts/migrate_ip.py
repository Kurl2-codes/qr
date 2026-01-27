import asyncio
import motor.motor_asyncio

async def migrate():
    client = motor.motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['qr_system']
    collection = db['qr_codes']
    
    cursor = collection.find({})
    async for doc in cursor:
        if 'localhost' in doc['proxy_url']:
            new_url = doc['proxy_url'].replace('localhost', '172.17.21.172')
            await collection.update_one({'_id': doc['_id']}, {'$set': {'proxy_url': new_url}})
            print(f"Updated {doc['_id']} to {new_url}")
            
    print("Migration complete")

if __name__ == "__main__":
    asyncio.run(migrate())
