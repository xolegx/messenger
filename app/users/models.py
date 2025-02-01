from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    online_status: Mapped[bool] = mapped_column(Boolean, default=False)
    department: Mapped[str] = mapped_column(String, default="Введите номер отдела")
    avatar: Mapped[int] = mapped_column(Integer, default=87)
    role: Mapped[str] = mapped_column(String, default='User')
    token: Mapped[str] = mapped_column(String, nullable=True)
    token_expiration: Mapped[DateTime] = mapped_column(DateTime, nullable=True)
