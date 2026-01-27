from fastapi import APIRouter
from app.api.routers import auth, qr_code, analytics

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(qr_code.router, prefix="/qr", tags=["qr"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
