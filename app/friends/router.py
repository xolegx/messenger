from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.friends.models import Friend
from app.users.models import User
from app.database import async_session_maker
from app.users.dependencies import get_current_user

router = APIRouter(prefix='/friends', tags=['Friends'])


@router.post("/add/{friend_id}")
async def add_friend(friend_id: int, db: AsyncSession = Depends(async_session_maker),
                     current_user: User = Depends(get_current_user)):
    # Проверка, существует ли друг
    result = await db.execute(select(User).filter(User.id == friend_id))
    friend = result.scalars().first()

    if not friend:
        raise HTTPException(status_code=404, detail="Friend not found")

    # Добавление в таблицу друзей
    new_friendship = Friend(user_id=current_user.id, friend_id=friend_id)
    db.add(new_friendship)
    await db.commit()

    return {"message": "Friend added successfully"}


@router.delete("/remove/{friend_id}")
async def remove_friend(friend_id: int, db: AsyncSession = Depends(async_session_maker),
                        current_user: User = Depends(get_current_user)):
    # Удаление из таблицы друзей
    friendship = await db.execute(
        select(Friend).filter(Friend.user_id == current_user.id, Friend.friend_id == friend_id))
    friendship_to_delete = friendship.scalars().first()

    if not friendship_to_delete:
        raise HTTPException(status_code=404, detail="Friendship not found")

    await db.delete(friendship_to_delete)
    await db.commit()

    return {"message": "Friend removed successfully"}


@router.get("/friends")
async def get_friends(db: AsyncSession = Depends(async_session_maker), current_user: User = Depends(get_current_user)):
    # Получение списка друзей
    result = await db.execute(select(Friend).filter(Friend.user_id == current_user.id))
    friends = result.scalars().all()

    friend_ids = [friend.friend_id for friend in friends]
    friend_details = await db.execute(select(User).filter(User.id.in_(friend_ids)))
    return friend_details.scalars().all()
