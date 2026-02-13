import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordBearer

from app.database import get_db
from app.models.database import User
from app.config import (
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI,
    FRONTEND_URL,
    logger
)
from app.utils.auth import create_access_token, verify_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if user is None:
        raise credentials_exception

    return user


@router.get("/login")
async def github_login():
    """
    Redirect to GitHub OAuth page.
    """
    scope = "user:email read:user repo"
    url = f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&redirect_uri={GITHUB_REDIRECT_URI}&scope={scope}"
    return RedirectResponse(url)


@router.get("/callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    """
    Handle GitHub OAuth callback.
    """
    # 1. Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_response.json()

    if "error" in token_data:
        logger.error(f"GitHub OAuth error: {token_data.get('error_description')}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=token_data.get("error_description", "OAuth failed")
        )

    access_token = token_data.get("access_token")

    # 2. Get user info from GitHub
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"token {access_token}",
                "Accept": "application/json",
            },
        )
        github_user = user_response.json()

        # Get email if not public
        if not github_user.get("email"):
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"token {access_token}",
                    "Accept": "application/json",
                },
            )
            emails = email_response.json()
            primary_email = next((e["email"] for e in emails if e["primary"]), emails[0]["email"] if emails else None)
            github_user["email"] = primary_email

    # 3. Create or update user in database
    github_id = str(github_user.get("id"))
    result = await db.execute(select(User).where(User.github_id == github_id))
    user = result.scalars().first()

    if not user:
        user = User(
            github_id=github_id,
            username=github_user.get("login"),
            email=github_user.get("email"),
            avatar_url=github_user.get("avatar_url"),
            access_token=access_token
        )
        db.add(user)
    else:
        user.username = github_user.get("login")
        user.email = github_user.get("email")
        user.avatar_url = github_user.get("avatar_url")
        user.access_token = access_token

    await db.commit()
    await db.refresh(user)

    # 4. Create JWT and redirect to frontend
    jwt_token = create_access_token(data={"sub": user.id})
    callback_url = f"{FRONTEND_URL}/auth/callback"
    return RedirectResponse(f"{callback_url}?token={jwt_token}")


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url
    }
