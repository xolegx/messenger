from pydantic import BaseModel, Field


class SFriendsRead(BaseModel):
    id: int = Field(..., description="Идентификатор пользователя")
    name: str = Field(..., min_length=3, max_length=50, description="Имя, от 3 до 50 символов")
    avatar: int = Field(..., description="avatar")
    online_status: bool = Field(..., description="online_status")
