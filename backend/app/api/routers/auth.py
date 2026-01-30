from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token
from app.crud import user as user_crud
from app.schemas.token import Token
from app.schemas.user import User, UserUpdate, UserPasswordUpdate
from app.api.deps import get_current_user
from datetime import timedelta
from app.core.config import settings

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return access token with HTTP-only cookie."""
    user = await user_crud.get_by_username(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False # In prod, set to True with HTTPS
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the current authenticated user's profile."""
    return current_user

@router.put("/users/me", response_model=User)
async def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    """Update current user's profile information."""
    return await user_crud.update(current_user.username, user_update)

@router.put("/users/me/password")
async def update_password(user_update: UserPasswordUpdate, current_user: User = Depends(get_current_user)):
    """Update current user's security credentials."""
    user = await user_crud.get_by_username(current_user.username)
    if not user or not verify_password(user_update.current_password, user["hashed_password"]):
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    await user_crud.update_password(current_user.username, user_update.new_password)
    return {"message": "Password updated successfully"}

@router.post("/logout")
async def logout(response: Response):
    """Invalidate session and clear authentication cookies."""
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
