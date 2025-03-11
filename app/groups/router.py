# from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Depends, HTTPException, status
# from fastapi.responses import HTMLResponse
# from fastapi.templating import Jinja2Templates
# from typing import List, Dict
# from app.chat.core import MessagesCORE, encrypt_message, decrypt_message
# from app.chat.schemas import MessageRead, MessageCreate
# from app.chat.models import Message
# from app.files.models import File
# from app.users.core import UsersCORE
# from app.users.dependencies import get_current_user
# from app.users.models import User
# from app.database import async_session_maker
# from sqlalchemy.future import select
# from sqlalchemy import update, func
#
# import asyncio
#
# router = APIRouter(prefix='/groups', tags=['Groups'])
# templates = Jinja2Templates(directory='app/templates')
#
#
# @router.get("/", response_class=HTMLResponse, summary="Chat Page")
# async def get_chat_page(request: Request, user_data: User = Depends(get_current_user)):
#     users_all = await UsersCORE.find_all()
#     return templates.TemplateResponse("chat.html",
#                                       {"request": request, "user": user_data, 'users_all': users_all})