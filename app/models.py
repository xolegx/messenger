from pydantic import BaseModel
from typing import Optional, Annotated


class User(BaseModel):
    username: str
    password: str
    role: Optional[str] = None