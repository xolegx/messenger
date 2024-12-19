from pydantic import BaseModel
from typing import Optional


class User(BaseModel):
    username: str
    password: str
    role: Optional[str] = None


class Role:
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"
