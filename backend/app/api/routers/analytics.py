from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services import analytics_service
from app.schemas.analytics import AnalyticsOverview

router = APIRouter()

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(current_user = Depends(get_current_user)):
    """Retrieve high-level system analytics and recent scan logs."""
    return await analytics_service.get_overview()
