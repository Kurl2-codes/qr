from datetime import datetime
from typing import Optional
from pydantic import Field
from .base import BaseSchema

class WebsiteLink(BaseSchema):
    label: Optional[str] = None
    url: str

class PhoneDetail(BaseSchema):
    type: str
    number: str

class VCardData(BaseSchema):
    first_name: str
    last_name: str
    location: Optional[str] = None
    phone: Optional[str] = None
    phones: Optional[list[PhoneDetail]] = []
    email: Optional[str] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    website: Optional[str] = None
    websites: Optional[list[WebsiteLink]] = []

class QRCodeBase(BaseSchema):
    name: str = ""
    target_url: str = ""
    is_active: bool = True
    source: str = "General"
    qr_type: str = "url"
    vcard_data: Optional[VCardData] = None
    logo_image: Optional[str] = None
    
    # Custom QR Code Styling Options (persisted in DB)
    fg_color: Optional[str] = "#0b0f19"
    bg_color: Optional[str] = "#ffffff"
    include_margin: Optional[bool] = False
    border_radius: Optional[int] = 12
    border_width: Optional[int] = 0
    border_color: Optional[str] = "#3b82f6"
    shadow: Optional[str] = "none"
    is_gradient: Optional[bool] = False
    fg_color_start: Optional[str] = "#0b0f19"
    fg_color_end: Optional[str] = "#0b0f19"

class QRCodeCreate(QRCodeBase):
    pass

class QRCode(QRCodeBase):
    id: str = Field(validation_alias="_id")
    proxy_url: str
    clicks: int = 0
    created_at: datetime
    updated_at: datetime
