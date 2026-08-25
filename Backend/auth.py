import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pwdlib import PasswordHash


SECRET_KEY = os.getenv("PERSONAL_WEBSITE_SECRET_KEY")

ADMIN_USERNAME = os.getenv("PERSONAL_WEBSITE_ADMIN_USERNAME")

ADMIN_PASSWORD_HASH = os.getenv("PERSONAL_WEBSITE_ADMIN_PASSWORD_HASH")

if not SECRET_KEY:
    raise RuntimeError(
        "PERSONAL_WEBSITE_SECRET_KEY environment variable is not set."
    )

if not ADMIN_USERNAME:
    raise RuntimeError(
        "PERSONAL_WEBSITE_ADMIN_USERNAME environment variable is not set."
    )

if not ADMIN_PASSWORD_HASH:
    raise RuntimeError(
        "PERSONAL_WEBSITE_ADMIN_PASSWORD_HASH environment variable is not set."
    )


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()

security = HTTPBearer()


def verify_admin_password(password: str) -> bool:
    try:
        return password_hash.verify(
            password,
            ADMIN_PASSWORD_HASH,
        )
    except Exception:
        return False


def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": ADMIN_USERNAME,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        username = payload.get("sub")

        if username is None or username != ADMIN_USERNAME:
            raise credentials_exception

        return username

    except JWTError:
        raise credentials_exception
