from pydantic import BaseModel, Field


class FileRead(BaseModel):
    id: int = Field(..., description="Уникальный идентификатор файла")
    filename: str = Field(..., description="Имя файла")
    file_url: str = Field(..., description="Адрес расположения файла")
