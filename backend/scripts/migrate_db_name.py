import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def migrate_database():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    
    old_db_name = "qr_system"
    new_db_name = "qr360"
    
    print(f"--- Starting Migration: {old_db_name} -> {new_db_name} ---")
    
    existing_dbs = await client.list_database_names()
    if old_db_name not in existing_dbs:
        print(f"Error: Source database '{old_db_name}' not found.")
        return

    old_db = client[old_db_name]
    new_db = client[new_db_name]
    
    collections = await old_db.list_collection_names()
    
    for coll_name in collections:
        print(f"Migrating collection: {coll_name}...")
        cursor = old_db[coll_name].find()
        documents = await cursor.to_list(length=None)
        if documents:
            await new_db[coll_name].insert_many(documents)
        print(f"Successfully copied {len(documents)} documents for {coll_name}.")
    
    print(f"\nMigration to '{new_db_name}' complete.")
    print(f"Please update your .env file to use DATABASE_NAME={new_db_name}")
    print(f"After verification, you can run a script to drop the old '{old_db_name}' database.")

if __name__ == "__main__":
    asyncio.run(migrate_database())
