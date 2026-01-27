import asyncio
import os
import subprocess
from datetime import datetime

async def dump_database():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    db_name = "qr360"
    output_dir = f"db_dumps/dump_{timestamp}"
    
    print(f"--- Starting Database Dump: {db_name} ---")
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Command to dump the specific database
    # mongodump --db qr360 --out db_dumps/dump_20240127_123456
    command = [
        "mongodump",
        "--db", db_name,
        "--out", output_dir
    ]
    
    try:
        process = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Success! Database dumped to: {os.path.abspath(output_dir)}")
        print(f"To restore on a new machine, run:")
        print(f"mongorestore --db {db_name} {output_dir}/{db_name}")
    except subprocess.CalledProcessError as e:
        print(f"Error dumping database:")
        print(e.stderr)
    except FileNotFoundError:
        print("Error: 'mongodump' tool not found. Please install MongoDB Database Tools.")
        print("Download: https://www.mongodb.com/try/download/database-tools")

if __name__ == "__main__":
    asyncio.run(dump_database())
