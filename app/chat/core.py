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
'''    @classmethod
    async def get_messages_between_users(cls, user_id_1: int, user_id_2: int):
        async with async_session_maker() as session:
            # Получаем сообщения между двумя пользователями
            query = select(cls.model).filter(
                or_(
                    and_(cls.model.sender_id == user_id_1, cls.model.recipient_id == user_id_2),
                    and_(cls.model.sender_id == user_id_2, cls.model.recipient_id == user_id_1)
                )
            ).order_by(cls.model.id)

            result = await session.execute(query)
            messages = result.scalars().all()

            # Обновляем статус прочтения для непрочитанных сообщений
            if messages:
                # Находим все непрочитанные сообщения для текущего пользователя
                unread_messages = [msg for msg in messages if not msg.is_read and msg.recipient_id == user_id_2]

                if unread_messages:
                    # Обновляем статус прочтения
                    stmt = (
                        update(cls.model).
                        where(cls.model.id.in_([msg.id for msg in unread_messages])).
                        values(is_read=True)
                    )
                    await session.execute(stmt)
                    await session.commit()  # Сохраняем изменения в базе данных

            return messages'''