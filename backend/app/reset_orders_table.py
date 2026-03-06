from app.database import engine, Base
from app.models.order import Order, OrderItem
# Import models to ensure metadata is complete
from app.models import order
from sqlalchemy import text

def reset_orders():
    print("Dropping orders and order_items tables...")
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS order_items CASCADE;"))
            conn.execute(text("DROP TABLE IF EXISTS orders CASCADE;"))
            conn.commit()
        print("Tables dropped.")
        
        print("Recreating tables...")
        # This will create all tables if they don't exist, using the updated models
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_orders()
