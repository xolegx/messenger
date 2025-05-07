from sqlalchemy import Text, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship

from app.chat.models import Message
from app.database import Base


class File(Base):
    __tablename__ = 'files'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(Text, index=True)
    file_url: Mapped[str] = mapped_column(Text)
    file_size: Mapped[str] = mapped_column(Text)
    message_id: Mapped[int] = mapped_column(Integer, ForeignKey('messages.id'), nullable=True)
    sender: Mapped[str] = mapped_column(Text)
    recipient: Mapped[str] = mapped_column(Text)
    recipient_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    # message = relationship("Message", back_populates="files", foreign_keys="[File.message_id]", remote_side='[Message.id]')
