from sqlalchemy import select, and_, or_
from app.core.base import BaseCORE
from app.chat.models import Message
from app.database import async_session_maker


class MessagesCORE(BaseCORE):
    model = Message

    @classmethod
    async def get_messages_between_users(cls, user_id_1: int, user_id_2: int):
        """
        Асинхронно находит и возвращает все сообщения между двумя пользователями.

        Аргументы:
            user_id_1: ID первого пользователя.
            user_id_2: ID второго пользователя.

        Возвращает:
            Список сообщений между двумя пользователями.
        """
        async with async_session_maker() as session:
            query = select(cls.model).filter(
                or_(
                    and_(cls.model.sender_id == user_id_1, cls.model.recipient_id == user_id_2),
                    and_(cls.model.sender_id == user_id_2, cls.model.recipient_id == user_id_1)
                )
            ).order_by(cls.model.id)
            result = await session.execute(query)
            return result.scalars().all()


def update_user_status(user_id: int, status: str):
    # Здесь обнови статус пользователя в базе данных или памяти
    print(f"User {user_id} is now {status}")
    # Если используешь базу данных, пропиши соответствующий запрос

