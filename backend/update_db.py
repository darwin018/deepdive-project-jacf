from app.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("ALTER TABLE orders ADD COLUMN status VARCHAR DEFAULT 'Pending'"))
    print("Column added successfully!")
