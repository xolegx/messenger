from typing import List

from sqlalchemy import Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from sqlalchemy.orm import relationship


class Message(Base):
    __tablename__ = 'messages'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    recipient_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    group_chat_id: Mapped[int] = mapped_column(Integer, ForeignKey("group_chats.id"), nullable=True)
    content: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    is_sticker: Mapped[bool] = mapped_column(Boolean, default=False)
    is_file: Mapped[bool] = mapped_column(Boolean, default=False)
    id_file: Mapped[int] = mapped_column(Integer, ForeignKey("files.id"), nullable=True)

    # sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    # recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")
    # group_chat = relationship("GroupChat", back_populates="messages")
    # files = relationship("File", back_populates="message", foreign_keys="[File.message_id]", remote_side=[id])
