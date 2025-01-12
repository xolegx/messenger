from typing import List
from fastapi import APIRouter, Response, Depends
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from app.exceptions import UserAlreadyExistsException, IncorrectEmailOrPasswordException, PasswordMismatchException
from app.users.auth import get_password_hash, authenticate_user, create_access_token
from app.users.core import UsersCORE
from app.users.schemas import SUserRegister, SUserAuth, SUserRead
from fastapi.templating import Jinja2Templates
from app.users.dependencies import get_current_user
from app.users.models import User

router = APIRouter(prefix='/auth', tags=['Auth'])
templates = Jinja2Templates(directory='app/templates')


@router.get("/", response_class=HTMLResponse, summary="Страница авторизации")
async def get_categories(request: Request):
    return templates.TemplateResponse("auth.html", {"request": request})


@router.post("/register/")
async def register_user(user_data: SUserRegister) -> dict:
    user = await UsersCORE.find_one_or_none(email=user_data.email)
    if user:
        raise UserAlreadyExistsException

    if user_data.password != user_data.password_check:
        raise PasswordMismatchException("Пароли не совпадают")
    hashed_password = get_password_hash(user_data.password)
    await UsersCORE.add(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password
    )

    return {'message': 'Вы успешно зарегистрированы!'}


@router.post("/login/")
async def auth_user(response: Response, user_data: SUserAuth):
    check = await authenticate_user(email=user_data.email, password=user_data.password)
    if check is None:
        raise IncorrectEmailOrPasswordException
    access_token = create_access_token({"sub": str(check.id)})
    response.set_cookie(key="users_access_token", value=access_token, httponly=True)
    return {'ok': True, 'access_token': access_token, 'refresh_token': None, 'message': 'Авторизация успешна!'}


@router.post("/logout/")
async def logout_user(response: Response):
    response.delete_cookie(key="users_access_token")
    return {'message': 'Пользователь успешно вышел из системы'}


@router.get("/users", response_model=List[SUserRead])
async def get_users():
    users_all = await UsersCORE.find_all()
    # Используем генераторное выражение для создания списка
    return [{'id': user.id, 'name': user.name} for user in users_all]


@router.get("/profile")
async def get_profile(request: Request):
    return templates.TemplateResponse("profile.html", {"request": request})


@router.get("/friends")
async def get_profile(request: Request, user_data: User = Depends(get_current_user)):
    users_all = await UsersCORE.find_all()
    return templates.TemplateResponse("friends.html", {"request": request, "user": user_data, 'users_all': users_all})


@router.get("/groups")
async def get_profile(request: Request):
    return templates.TemplateResponse("groups.html", {"request": request})


@router.get("/files")
async def get_profile(request: Request):
    return templates.TemplateResponse("files.html", {"request": request})
