from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import LoginRequest, RegisterRequest
from backend.app.core.security import verify_password
from backend.app.core.jwt import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    if not verify_password(
        request.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    token = create_access_token(
        {
            "sub": user.email,
            "role": user.role
        }
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name or user.email.split("@")[0],
            "role": user.role
        }
    }

@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    email = request.email
    password = request.password
    full_name = request.full_name or (email.split("@")[0] if email else "Creator")
    role = request.role or "creator"

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    from backend.app.core.security import hash_password
    new_user = User(
        full_name=full_name,
        email=email,
        password=hash_password(password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "name": new_user.full_name,
            "role": new_user.role
        }
    }