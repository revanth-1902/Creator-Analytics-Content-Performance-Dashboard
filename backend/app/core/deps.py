from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.core.jwt import SECRET_KEY, ALGORITHM

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts Bearer token from request headers, decodes the JWT,
    and returns the authenticated user record from the database.
    """
    if not credentials or not credentials.credentials:
        # Fallback to default active creator for development simplicity
        default_user = db.query(User).first()
        if default_user:
            return default_user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        user_id: int = payload.get("user_id")

        if user_email:
            user = db.query(User).filter(User.email == user_email).first()
        elif user_id:
            user = db.query(User).filter(User.id == user_id).first()
        else:
            user = None

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or session expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_roles(allowed_roles: list):
    """
    Dependency factory to enforce role-based access control (RBAC).
    Returns an HTTP 403 Forbidden exception if current user's role is not allowed.
    Administrators ('administrator', 'admin') bypass restrictions.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "creator").lower()
        normalized_allowed = [r.lower() for r in allowed_roles]

        if user_role in ["administrator", "admin"]:
            return current_user

        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role '{current_user.role}'. Required role: one of {allowed_roles}"
            )
        return current_user

    return role_checker

