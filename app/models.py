from pydantic import BaseModel


class User(BaseModel):
    id: int
    age: int
    username: str
    user_info: str
