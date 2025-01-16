from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    online_status: Mapped[bool] = mapped_column(Boolean, default=False)
    department: Mapped[int] = mapped_column(Integer, default=0)
    avatar: Mapped[int] = mapped_column(Integer, default=0)
    role: Mapped[str] = mapped_column(String, default='User')

