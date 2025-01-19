from pydantic import BaseModel, EmailStr, Field


class SUserRegister(BaseModel):
    email: EmailStr = Field(..., description="Электронная почта")
    password: str = Field(..., min_length=5, max_length=50, description="Пароль, от 5 до 50 знаков")
    password_check: str = Field(..., min_length=5, max_length=50, description="Пароль, от 5 до 50 знаков")
    name: str = Field(..., min_length=3, max_length=50, description="Имя, от 3 до 50 символов")


class SUserAuth(BaseModel):
    email: EmailStr = Field(..., description="Электронная почта")
    password: str = Field(..., min_length=5, max_length=50, description="Пароль, от 5 до 50 знаков")


class SUserRead(BaseModel):
    id: int = Field(..., description="Идентификатор пользователя")
    name: str = Field(..., min_length=3, max_length=50, description="Имя, от 3 до 50 символов")
    avatar: int = Field(..., description="avatar")
    online_status: bool = Field(..., description="online_status")
    department: str = Field(..., description="department")
    role: str = Field(..., description="role")


class SProfile(BaseModel):
    id: int = Field(..., description="Идентификатор пользователя")
    avatar: int = Field(..., description="avatar")
    department: int = Field(..., description="department")


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., description="Старый пароль пользователя")
    new_password: str = Field(..., description="Новый пароль пользователя")


class ChangeNameRequest(BaseModel):
    new_name: str = Field(..., description="Новое имя пользователя")


class ChangeDepartmentRequest(BaseModel):
    new_department: str = Field(..., description="Новый номер отдела")
