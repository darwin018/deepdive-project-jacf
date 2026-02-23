from app.database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        result = conn.execute(text("SELECT status FROM orders LIMIT 1"))
        print("Success! Status column exists.")
except Exception as e:
    print("Error:", e)
