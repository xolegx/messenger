from pydantic import BaseModel, Field
from datetime import datetime


class MessageRead(BaseModel):
    id: int = Field(..., description="Уникальный идентификатор сообщения")
    sender_id: int = Field(..., description="ID отправителя сообщения")
    recipient_id: int = Field(..., description="ID получателя сообщения")
    content: str = Field(..., description="Содержимое сообщения")
    created_at: datetime = Field(..., description="Date сообщения")
    is_sticker: bool = Field(..., description="Стикер ли?")
    is_file: bool = Field(..., description="Файл ли?")
    is_read: bool = Field(..., description="Прочитанно ли?")
    # group_chat_id: int = Field(..., description="ID chat")


class MessageCreate(BaseModel):
    recipient_id: int = Field(..., description="ID получателя сообщения")
    content: str = Field(..., description="Содержимое сообщения")
    is_sticker: bool = Field(default=False, description="Стикер ли?")
    is_file: bool = Field(default=False, description="Файл ли?")
