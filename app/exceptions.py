from fastapi import status, HTTPException


class TokenExpiredException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail="����� �����")


class TokenNoFoundException(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail="����� �� ������")


UserAlreadyExistsException = HTTPException(status_code=status.HTTP_409_CONFLICT,
                                           detail='������������ ��� ����������')

PasswordMismatchException = HTTPException(status_code=status.HTTP_409_CONFLICT, detail='������ �� ���������!')

IncorrectEmailOrPasswordException = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                                  detail='�������� ����� ��� ������')

NoJwtException = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                               detail='����� �� ��������!')

NoUserIdException = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                  detail='�� ������ ID ������������')

ForbiddenException = HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='������������ ����!')
