from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    whatsapp_number = Column(String)
    shipping_address = Column(String)
    permanent_address = Column(String)
    total_savings = Column(Float)
    grand_total = Column(Float)
    status = Column(String, default="Pending")
    payment_status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float) # Price per unit at time of purchase

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
