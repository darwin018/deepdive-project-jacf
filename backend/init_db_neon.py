from app.database import engine, Base
from app.models.admin import Admin
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.category import Category
from app.models.item import Item
# from app.models.user import User
# from app.models.inventory import Category, Product, Warehouse, Stock
# from app.models.partners import Customer, Client
# from app.models.logistics import Transport, Bill, BillItem

def init_db():
    print("Connecting to Neon and creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    init_db()