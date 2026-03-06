from pydantic import BaseModel
from typing import Optional

class AdminBase(BaseModel):
    username: str

class AdminCreate(AdminBase):
    password: str

class AdminLogin(AdminBase):
    password: str

class Admin(AdminBase):
    id: int

    class Config:
        from_attributes = True
