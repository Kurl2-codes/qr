from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.api import api_router
from app.api.routers import redirect
from app.core.config import settings
from app.core.database import client, users_collection
from app.core.security import get_password_hash

from contextlib import asynccontextmanager
from app.core.logging_config import setup_logging, logger

# Initialize structured logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    try:
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Seed Admin User
        if await users_collection.count_documents({}) == 0:
            admin_user = {
                "username": "admin",
                "hashed_password": get_password_hash("password"),
                "full_name": "Administrator",
                "profile_image": None
            }
            await users_collection.insert_one(admin_user)
            logger.info("Admin user created: admin/password")
            
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
    
    yield
    # Shutdown logic (if any) can go here

app = FastAPI(title="QR Redirect System", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Mounting
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(api_router, prefix="/api")
app.include_router(redirect.router, prefix="/q")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
