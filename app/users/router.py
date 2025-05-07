from typing import List
from fastapi import APIRouter, Response, Depends, HTTPException
from fastapi.requests import Request
from fastapi.responses import HTMLResponse
from app.exceptions import UserAlreadyExistsException, IncorrectEmailOrPasswordException, PasswordMismatchException
from app.users.auth import get_password_hash, authenticate_user, create_access_token
from app.users.core import UsersCORE
from app.users.schemas import SUserRegister, SUserAuth, SUserRead, ChangePasswordRequest, ChangeNameRequest, \
    ChangeDepartmentRequest, LastSeen, UserLastSeen
from fastapi.templating import Jinja2Templates
from app.users.dependencies import get_current_user
from app.users.models import User
from app.database import async_session_maker
from sqlalchemy.future import select
from passlib.context import CryptContext

router = APIRouter(prefix='/auth', tags=['Auth'])
templates = Jinja2Templates(directory='app/templates')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.get("/", response_class=HTMLResponse, summary="Страница авторизации")
async def get_categories(request: Request):
    return templates.TemplateResponse("auth.html", {"request": request})


@router.post("/register/")
async def register_user(user_data: SUserRegister) -> dict:
    user_name = await UsersCORE.find_one_or_none(name=user_data.name)
    user_email = await UsersCORE.find_one_or_none(email=user_data.email)

    if user_email or user_name:
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
    return [{'id': user.id,
             'name': user.name,
             'avatar': user.avatar,
             'online_status': user.online_status,
             'department': user.department,
             'role': user.role} for user in users_all]


@router.get("/user/{user_id}", response_model=SUserRead)
async def get_user(user_id: int):
    user = await UsersCORE.find_one_or_none_by_id(user_id)
    return user


@router.get("/profile")
async def get_profile(request: Request, user_data: User = Depends(get_current_user)):
    return templates.TemplateResponse("profile.html", {"request": request, "user": user_data})


@router.get("/friends")
async def get_friends(request: Request, user_data: User = Depends(get_current_user)):
    users_all = await UsersCORE.find_all()
    return templates.TemplateResponse("friends.html", {"request": request, "user": user_data, 'users_all': users_all})


@router.get("/groups")
async def get_groups(request: Request, user_data: User = Depends(get_current_user)):
    return templates.TemplateResponse("groups.html", {"request": request, "user": user_data})


@router.get("/files")
async def get_files(request: Request, user_data: User = Depends(get_current_user)):
    return templates.TemplateResponse("files.html", {"request": request, "user": user_data})


@router.delete("/user/")
async def delete_user(user_data: User = Depends(get_current_user)):
    await UsersCORE.delete_by_id(
        data_id=user_data.id
    )


@router.put("/users/{user_id}/{avatar}")
async def update_avatar(user_id: int, new_avatar: int):
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).filter(User.id == user_id)
        )
        user = result.scalars().first()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        user.avatar = new_avatar
        await session.commit()
        await session.refresh(user)

        return {"id": user.id, "avatar": user.avatar}


@router.put("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: User = Depends(get_current_user)):
    if not pwd_context.verify(request.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Неправильный старый пароль")

    async with async_session_maker() as session:
        hashed_new_password = pwd_context.hash(request.new_password)
        current_user.hashed_password = hashed_new_password
        session.add(current_user)
        await session.commit()

        return {"detail": "Пароль успешно изменен"}


@router.put("/change-name")
async def change_name(request: ChangeNameRequest, current_user: User = Depends(get_current_user)):
    existing_user = await UsersCORE.find_one_or_none(name=request.new_name)
    if existing_user:
        raise UserAlreadyExistsException

    current_user.name = request.new_name  # Обновляем имя пользователя
    async with async_session_maker() as session:
        session.add(current_user)
        await session.commit()
    return {"detail": "Имя успешно изменено"}


@router.put("/change-department")
async def change_department(request: ChangeDepartmentRequest, current_user: User = Depends(get_current_user)):
    current_user.department = request.new_department  # Обновляем отдел пользователя
    async with async_session_maker() as session:
        session.add(current_user)
        await session.commit()
    return {"detail": "Отдел успешно изменен"}


@router.put("/user/status_on/{user_id}")
async def status_on(user_id: int):
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).filter(User.id == user_id)
        )
        user = result.scalars().first()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        user.online_status = True
        await session.commit()


@router.put("/user/status_off/{user_id}")
async def status_off(user_id: int):
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).filter(User.id == user_id)
        )
        user = result.scalars().first()

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        user.online_status = False
        await session.commit()


@router.get("/users/check_status/")
async def check_status():
    async with async_session_maker() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()

        if not users:
            raise HTTPException(status_code=404, detail="No users found")

        user_statuses = [
            {"id": user.id, "name": user.name, "online_status": user.online_status}
            for user in users
        ]

        return {"users": user_statuses}


@router.put("/last_seen")
async def last_seen(request: LastSeen, current_user: User = Depends(get_current_user)):
    current_user.last_seen = request.last_seen
    async with async_session_maker() as session:
        session.add(current_user)
        await session.commit()
    return {"message": "Last seen updated successfully"}


@router.get("/user/last_seen/{user_id}", response_model=UserLastSeen)
async def get_user_last_seen(user_id):
    async with async_session_maker() as session:
        result = await session.execute(
            select(User.id, User.last_seen).filter(User.id == user_id)
        )
        user = result.first()

    return user
