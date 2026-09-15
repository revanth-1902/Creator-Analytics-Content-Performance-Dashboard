from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):
    id: int
    full_name: Optional[str] = ""
    email: str
    role: Optional[str] = "creator"

    model_config = {
        "from_attributes": True
    }