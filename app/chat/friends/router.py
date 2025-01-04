from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.users.core import UsersCORE
from app.users.dependencies import get_current_user
from app.users.models import User
from typing import List, Dict


router = APIRouter(prefix='/friends', tags=['Friends'])
templates = Jinja2Templates(directory='app/templates')

@router.get("/", response_class=HTMLResponse, summary="Friends List")
async def get_friends_page(request: Request, current_user: User = Depends(get_current_user)):
    # Предположим, что у нас есть метод для получения списка друзей
    friends = await UsersCORE.get_friends(current_user.id)
    return templates.TemplateResponse("friends.html", {"request": request, "user": current_user, "friends": friends})

@router.get("/search", response_model=List[User])
async def search_users(query: str, current_user: User = Depends(get_current_user)):
    # Поиск пользователей по имени или другому критерию
    return await UsersCORE.search_users(query=query)
