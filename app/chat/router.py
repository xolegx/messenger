from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import List, Dict
from app.chat.core import MessagesCORE, encrypt_message, decrypt_message
from app.chat.schemas import MessageRead, MessageCreate
from app.chat.models import Message
from app.files.models import File
from app.users.core import UsersCORE
from app.users.dependencies import get_current_user
from app.users.models import User
from app.database import async_session_maker
from sqlalchemy.future import select
from sqlalchemy import update, func, or_

import asyncio

router = APIRouter(prefix='/chat', tags=['Chat'])
templates = Jinja2Templates(directory='app/templates')
active_connections: Dict[int, WebSocket] = {}


async def notify_user(user_id: int, message: dict):
    if user_id in active_connections:
        websocket = active_connections[user_id]
        await websocket.send_json(message)


@router.get("/", response_class=HTMLResponse, summary="Chat Page")
async def get_chat_page(request: Request, user_data: User = Depends(get_current_user)):
    users_all = await UsersCORE.find_all()
    return templates.TemplateResponse("chat.html",
                                      {"request": request, "user": user_data, 'users_all': users_all})


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    active_connections[user_id] = websocket
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        active_connections.pop(user_id, None)


@router.get("/messages/{user_id}", response_model=List[MessageRead])
async def get_messages(user_id: int, current_user: User = Depends(get_current_user)):
    return await MessagesCORE.get_messages_between_users(user_id_1=user_id, user_id_2=current_user.id) or []


@router.post("/messages")
async def send_message(message: MessageCreate, current_user: User = Depends(get_current_user)):
    encrypted_content = encrypt_message(message.content)  # Шифруем и декодируем в строку

    created_message_id = await MessagesCORE.add(
        sender_id=current_user.id,
        content=encrypted_content,  # Сохраняем зашифрованное содержимое
        recipient_id=message.recipient_id,
        is_file=message.is_file,
        is_img=message.is_img,
        # id_file=message.id_file,
    )
    # message_data = {
    #     'sender_id': current_user.id,
    #     'recipient_id': message.recipient_id,
    #     'content': message.content,
    #     'id': created_message_id,
    # }
    # await notify_user(message.recipient_id, message_data)
    # await notify_user(current_user.id, message_data)
    return {'id': created_message_id,
            'recipient_id': message.recipient_id,
            'content': message.content,
            'status': 'ok',
            'msg': 'Message saved!'}


@router.put("/messages/{message_id}/read")
async def mark_as_read(message_id: int):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(Message.id == message_id)
        )
        message = result.scalars().first()

        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        message.is_read = True
        await session.commit()
        await session.refresh(message)

    return message


@router.get("/messages/unread_counts/")
async def count_unread_messages(user_data: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(
                Message.recipient_id == user_data.id,
                Message.is_read == False
            )
        )
        unread_messages = result.scalars().all()  # Получаем все непрочитанные сообщения

        # Создаем словарь для хранения количества непрочитанных сообщений по пользователям
        unread_count_by_user = {}
        for message in unread_messages:
            sender_id = message.sender_id
            if sender_id not in unread_count_by_user:
                unread_count_by_user[sender_id] = 0
            unread_count_by_user[sender_id] += 1

    return {"unread_counts": unread_count_by_user}


@router.put("/messages/read/{user_id}")
async def read_messages(user_id: int, user_data: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(
                Message.recipient_id == user_data.id,
                Message.sender_id == user_id,
                Message.is_read == False
            )
        )
        unread_messages = result.scalars().all()  # Получаем все непрочитанные сообщения
        if unread_messages:
            await session.execute(
                update(Message).where(
                    Message.id.in_([message.id for message in unread_messages])
                ).values(is_read=True)
            )

            # Не забудьте зафиксировать изменения
            await session.commit()


@router.get("/messages/last_messages/")
async def get_last_message(current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(or_(Message.sender_id == current_user.id, Message.recipient_id == current_user.id)))
        last_messages = result.scalars().all()
        last_message ={}
        for message in last_messages:
            contact_id = message.sender_id if message.recipient_id == current_user.id else message.recipient_id
            if contact_id not in last_messages:
                last_message[contact_id] = decrypt_message(message.content)
        return last_message


@router.get("/file-id-by-message/{message_id}")
async def get_file_id_by_message(message_id: int, current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(select(File).filter(File.message_id == message_id))
        db_message = result.scalars().first()
        if not db_message:
            raise HTTPException(status_code=404, detail="Message not found")

        file_id = db_message.id
        if not file_id:
            raise HTTPException(status_code=404, detail="No files found for this message")

        return {"file_id": db_message.id}


@router.put("/messages/{message_id}")
async def edit_message(message_id: int, new_content: str):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(Message.id == message_id)
        )
        message = result.scalar_one_or_none()

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        message.content = encrypt_message(new_content)
        session.add(message)
        await session.commit()

        return {"message": "Message updated successfully"}


@router.delete("/messages/{message_id}")
async def delete_message(message_id: int):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(Message.id == message_id)
        )
        message = result.scalar_one_or_none()

        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        await session.delete(message)
        await session.commit()

        return {"message": "Message deleted successfully"}
