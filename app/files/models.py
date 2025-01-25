from sqlalchemy import Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.database import Base


class File(Base):
    tablename = 'files'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(Text, index=True)
    file_url: Mapped[str] = mapped_column(Text)
    message_id: Mapped[int] = mapped_column(Integer, ForeignKey('messages.id'))


message = relationship("Message", back_populates="files")
