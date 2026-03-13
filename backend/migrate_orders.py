from app.database import engine
from sqlalchemy import text

def migrate():
    print("Migrating database...")
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS state VARCHAR"))
            conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR"))
            conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS pincode VARCHAR"))
        print("Migration successful!")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    migrate()
