from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .product import Product

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_email: str
    name: str
    whatsapp_number: str
    shipping_address: str
    permanent_address: str
    total_savings: float
    grand_total: float
    status: str = "Pending"
    payment_status: str = "Pending"

class OrderStatusUpdate(BaseModel):
    status: str

class OrderPaymentStatusUpdate(BaseModel):
    payment_status: str

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
