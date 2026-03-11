from sqlalchemy import Column, Integer, String, LargeBinary
from sqlalchemy.orm import relationship, deferred
from ..database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    image_url = Column(String)
    image_data = deferred(Column(LargeBinary))
    image_mime_type = deferred(Column(String))
    
    products = relationship("Product", back_populates="category")

