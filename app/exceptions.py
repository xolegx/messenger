from fastapi import status, HTTPException


class TokenExpiredException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail="Токен истек")


class TokenNoFoundException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail="Токен не найден")


class NoJwtException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail="Токен не валидный!")


UserAlreadyExistsException = HTTPException(status_code=status.HTTP_409_CONFLICT,
                                           detail='Пользователь уже существует')

PasswordMismatchException = HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Пароли не совпадают!')

IncorrectEmailOrPasswordException = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                                  detail='Неверная почта или пароль')


NoUserIdException = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                  detail='Не найден ID пользователя')

ForbiddenException = HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Недостаточно прав!')
