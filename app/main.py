#!/usr/bin/env python
# -*- coding: utf-8 -*-

from fastapi import FastAPI, Request, HTTPException

app = FastAPI()


@app.get("/headers")
async def get_headers(request: Request):
    user_agent = request.headers["user-agent"]
    accept_language = request.headers["accept-language"]

    if user_agent and accept_language == "ru-RU,ru;q=0.9,en-GB;q=0.8,en;q=0.7,en-US;q=0.6":
        return {
            "User-Agent": user_agent,
            "Accept-Language": accept_language
        }
    raise HTTPException(status_code=400, detail="Missing required headers")




