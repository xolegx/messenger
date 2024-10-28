#!/usr/bin/env python
# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.responses import FileResponse
from models import User

app = FastAPI()


def is_adult(age: int) -> bool:
    return age >= 18


@app.get("/")
def root():
    return FileResponse("app/index.html")


# альтернативный вариант
@app.get("/file", response_class=FileResponse)
async def root_html():
    return "app/index.html"\


fake_db = [{"id": "1", "age": "18", "username": "vasya", "user_info": "любит колбасу"}, {"id": "2", "age": "83","username": "dasha", "user_info": "любит петь"}]
fake_users = {
    1: {"username": "john_doe", "email": "john@example.com"},
    2: {"username": "jane_smith", "email": "jane@example.com"},
}
@app.get('/users')  # маршрут GET для ПОЛУЧЕНИЯ каких-то данных с сервера
async def get_all_users():
    return fake_db


@app.post('/add_user', response_model=User)  # маршрут POST для отправления какой-то информации на сервер
async def add_user(user:User):  # принимает два query-параметра, про которые будет рассказано дальше в этом уроке (это не типичный пример пост-запроса)
    fake_db.append({"id": user.id, "age": user.age, "username": user.username, "user_info": user.user_info})
    return {"message": "юзер успешно добавлен в базу данных"}

@app.get("/users/{user_id}")
def read_user(user_id: int):
    if user_id in fake_users:
        return fake_users[user_id]
    return {"error": "User not found"}


@app.post("/user")
def create_user(user:User):
    user_data = user.dict()  # Преобразуем объект User в словарь
    user_data["is_adult"] = is_adult(user.age)  # Добавляем поле is_adult
    return user_data


@app.post("/calculate")
def calculate(num1: int = 5, num2: int = 10):
    return {"result": num1 + num2}


