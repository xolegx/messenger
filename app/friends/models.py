from sqlalchemy import Integer, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.users.models import User


class Friend(Base):
    __tablename__ = 'friends'

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), primary_key=True)
    friend_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), primary_key=True)
    online_status: Mapped[bool] = mapped_column(Boolean, ForeignKey('users.id'), default=False)

    user: Mapped[User] = relationship("User", foreign_keys=[user_id])
    friend: Mapped[User] = relationship("User", foreign_keys=[friend_id])
    status: Mapped[User] = relationship("User", foreign_keys=[online_status])
