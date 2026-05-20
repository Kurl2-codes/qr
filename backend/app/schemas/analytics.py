from datetime import datetime
from typing import Optional, List, Dict, Any
from .base import BaseSchema

class ClickLog(BaseSchema):
    qr_id: str
    timestamp: datetime
    user_agent: Optional[str] = None
    browser: Optional[str] = None
    browser_version: Optional[str] = None
    os: Optional[str] = None
    os_version: Optional[str] = None
    device_brand: Optional[str] = None
    device_model: Optional[str] = None
    device_type: Optional[str] = None
    qr_name: Optional[str] = "Unknown"
    source: str = "General"
    country: Optional[str] = "Unknown"
    city: Optional[str] = "Unknown"
    region: Optional[str] = "Unknown"
    ip_address: Optional[str] = "Unknown"

class AnalyticsOverview(BaseSchema):
    total_clicks: int
    total_qrs: int
    active_links: int
    daily_clicks: List[Dict[str, Any]]
    top_qrs: List[Dict[str, Any]]
    device_stats: List[Dict[str, Any]]
    os_stats: List[Dict[str, Any]]
    browser_stats: List[Dict[str, Any]]
    model_stats: List[Dict[str, Any]]
    country_stats: List[Dict[str, Any]] = []
    city_stats: List[Dict[str, Any]] = []
    recent_scans: List[ClickLog]
