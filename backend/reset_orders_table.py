from app.database import engine, Base
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.category import Category

from sqlalchemy import text

# Import all models to ensure metadata is complete
from app.models import order

def reset_orders():
    print("Dropping orders and order_items tables...")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS order_items CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS orders CASCADE;"))
        conn.commit()
    print("Tables dropped.")
    
    print("Recreating tables...")
    # This will create all tables if they don't exist, using the updated models
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

if __name__ == "__main__":
    reset_orders()
