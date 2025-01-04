from sqlalchemy import select, and_, or_
from sqlalchemy.exc import NoResultFound
from app.core.base import BaseCORE
from app.chat.models import Message
from app.database import async_session_maker
from app.users.models import User

import logging
logging.basicConfig(filename='app.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


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


async def update_user_status(user_id: int, status: str):
    async with async_session_maker() as session:
        try:
            # Находим пользователя по user_id
            user = await session.query(User).filter(User.id == user_id)

            # Обновляем статус
            user.status = status

            # Сохраняем изменения в базе данных
            session.commit()
            logging.info(f"Статус пользователя с ID {user_id} обновлен на '{status}'.")

        except NoResultFound:
            logging.warning(f"Пользователь с ID {user_id} не найден.")
            session.rollback()  # Откатываем изменения, если пользователь не найден
        except Exception as e:
            logging.error(f"Произошла ошибка: {e}")
            session.rollback()  # Откатываем изменения при ошибке
        finally:
            session.close()  # Закрываем сессию
