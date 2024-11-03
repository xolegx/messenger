#!/usr/bin/env python
# -*- coding: utf-8 -*-

from fastapi import FastAPI, Depends, HTTPException, status
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
import auth

app = FastAPI()


@app.post("/token/")
def login(user_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user_data_from_db = auth.get_user(user_data.username)
    if user_data_from_db is None or user_data.password != user_data_from_db.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": auth.create_jwt_token({"sub": user_data.username})}


@app.get("/admin/")
def get_admin_info(current_user: str = Depends(auth.get_user_from_token)):
    user_data = auth.get_user(current_user)
    if user_data.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return {"message": "Welcome Admin!"}


@app.get("/user/")
def get_user_info(current_user: str = Depends(auth.get_user_from_token)):
    user_data = auth.get_user(current_user)
    if user_data.role != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return {"message": "Hello User!"}
