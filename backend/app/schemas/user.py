from typing import Optional
from .base import BaseSchema

class UserBase(BaseSchema):
    username: str
    full_name: str = ""
    profile_image: Optional[str] = None

class User(UserBase):
    pass

class UserInDB(UserBase):
    hashed_password: str

class UserPasswordUpdate(BaseSchema):
    current_password: str
    new_password: str

class UserUpdate(BaseSchema):
    full_name: str
    profile_image: Optional[str] = None
