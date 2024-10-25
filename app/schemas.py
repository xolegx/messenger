from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True


class MessageCreate(BaseModel):
    content: str


class Message(MessageCreate):
    id: int
    user: User

    class Config:
        orm_mode = True
