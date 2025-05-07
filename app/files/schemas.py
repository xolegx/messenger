from pydantic import BaseModel, Field
from datetime import datetime


class FileRead(BaseModel):
    id: int = Field(..., description="Уникальный идентификатор файла")
    filename: str = Field(..., description="Имя файла")
    file_url: str = Field(..., description="Адрес расположения файла")
    file_size: str = Field(..., description="Размер файла")
    sender: str = Field(..., description="Имя отправителя")
    recipient: str = Field(..., description="Имя получателя")
    created_at: datetime = Field(..., description="Date файла")
