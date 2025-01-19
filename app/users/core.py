from app.core.base import BaseCORE
from app.users.models import User
from app.database import async_session_maker
from sqlalchemy.future import select


class UsersCORE(BaseCORE):
    model = User

    @classmethod
    async def delete_by_id(cls, data_id: int):
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=data_id)
            result = await session.execute(query)
            instans = result.scalar_one_or_none()
            if instans:
                await session.delete(instans)
                await session.commit()
                return True
            return False


