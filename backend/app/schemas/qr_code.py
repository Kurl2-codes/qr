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

class QRCodeCreate(QRCodeBase):
    pass

class QRCode(QRCodeBase):
    id: str = Field(validation_alias="_id")
    proxy_url: str
    clicks: int = 0
    created_at: datetime
    updated_at: datetime
