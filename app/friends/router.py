from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from app.friends.models import Friend
from app.friends.schemas import SFriendsRead
from app.users.models import User
from app.database import async_session_maker
from app.users.dependencies import get_current_user
from sqlalchemy import or_
from typing import List

router = APIRouter(prefix='/friends', tags=['Friends'])


@router.post("/add/{friend_id}")
async def add_friend(friend_id: int, current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(select(User).filter(User.id == friend_id))
        friend = result.scalars().first()

        if not friend:
            raise HTTPException(status_code=404, detail="Friend not found")

        # Добавление в таблицу друзей
        new_friendship = Friend(user_id=current_user.id, friend_id=friend_id)
        session.add(new_friendship)
        await session.commit()

        return {"message": "Friend added successfully"}


@router.delete("/remove/{friend_id}")
async def remove_friend(friend_id: int, current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        friendship = await session.execute(
            select(Friend).filter(Friend.user_id == current_user.id, Friend.friend_id == friend_id))
        friendship_to_delete = friendship.scalars().first()

        if not friendship_to_delete:
            raise HTTPException(status_code=404, detail="Friendship not found")

        await session.delete(friendship_to_delete)
        await session.commit()

    return {"message": "Friend removed successfully"}


@router.get("/", response_model=List[SFriendsRead])
async def get_friends(current_user: User = Depends(get_current_user)):
    friend_ids = set()
    async with async_session_maker() as session:
        result = await session.execute(
            select(Friend).filter(or_(Friend.user_id == current_user.id, Friend.friend_id == current_user.id))
        )
        friendships = result.scalars().all()

        for friendship in friendships:
            if friendship.user_id != current_user.id:
                friend_ids.add(friendship.user_id)
            if friendship.friend_id != current_user.id:
                friend_ids.add(friendship.friend_id)
        if not friend_ids:
            return []
        friends_query = select(User).filter(User.id.in_(friend_ids))
        result = await session.execute(friends_query)
        friends = result.scalars().all()
    return friends
