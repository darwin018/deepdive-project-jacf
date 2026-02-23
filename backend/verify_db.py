from app.database import SessionLocal
from sqlalchemy import text
import sys

def test_connection():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        print("Connection successful!")
        db.close()
        sys.exit(0)
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
