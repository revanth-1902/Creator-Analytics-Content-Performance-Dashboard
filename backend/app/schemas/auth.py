from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "creator"