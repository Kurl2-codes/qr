import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def cleanup_databases():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    
    dbs_to_drop = ["qr_system"]
    
    print(f"--- Starting Database Cleanup ---")
    
    existing_dbs = await client.list_database_names()
    
    for db_name in dbs_to_drop:
        if db_name in existing_dbs:
            print(f"Dropping database: {db_name}...")
            await client.drop_database(db_name)
            print(f"Successfully dropped {db_name}.")
        else:
            print(f"Database {db_name} not found, skipping.")
            
    print("\n--- Current Databases ---")
    final_dbs = await client.list_database_names()
    for db in final_dbs:
        print(f"- {db}")
    
    print("\nCleanup complete.")

if __name__ == "__main__":
    asyncio.run(cleanup_databases())
