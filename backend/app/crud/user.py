from app.core.database import users_collection
from app.core.security import get_password_hash
from app.schemas.user import UserUpdate, UserPasswordUpdate

async def get_by_username(username: str):
    return await users_collection.find_one({"username": username})

async def update(username: str, obj_in: UserUpdate):
    update_data = obj_in.dict(exclude_unset=True)
    await users_collection.update_one(
        {"username": username},
        {"$set": update_data}
    )
    return await get_by_username(username)

async def update_password(username: str, new_password: str):
    hashed_password = get_password_hash(new_password)
    await users_collection.update_one(
        {"username": username},
        {"$set": {"hashed_password": hashed_password}}
    )
    return True

async def create_user(username: str, password: str):
    hashed_password = get_password_hash(password)
    user_data = {
        "username": username,
        "hashed_password": hashed_password,
        "full_name": "",
        "profile_image": None
    }
    await users_collection.insert_one(user_data)
    return user_data
