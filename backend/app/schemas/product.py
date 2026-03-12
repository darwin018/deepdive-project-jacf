from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    quantity: int
    actual_price: float
    offer_price: float
    category_id: Optional[int] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    actual_price: Optional[float] = None
    offer_price: Optional[float] = None
    category_id: Optional[int] = None

class Product(ProductBase):
    id: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True
