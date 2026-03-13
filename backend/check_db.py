from app.database import engine
from sqlalchemy import inspect

def check_columns():
    inspector = inspect(engine)
    columns = inspector.get_columns('orders')
    print("Columns in 'orders' table:")
    for column in columns:
        print(f"- {column['name']} ({column['type']})")

if __name__ == "__main__":
    check_columns()
