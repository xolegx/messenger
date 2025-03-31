from sqlalchemy import Integer, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
# from sqlalchemy.orm import relationship
from datetime import datetime


class GroupChat(Base):
    __tablename__ = 'group_chats'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    # members = relationship("User", secondary="group_chat_members", back_populates="group_chats")
    # messages = relationship("Message", back_populates="group_chat")


class GroupChatMember(Base):
    __tablename__ = 'group_chat_members'

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), primary_key=True)
    group_chat_id: Mapped[int] = mapped_column(Integer, ForeignKey('group_chats.id'), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
