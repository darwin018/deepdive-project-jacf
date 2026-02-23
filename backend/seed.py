from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from app.utils import Hash

def seed_data():
    db = SessionLocal()
    
    # Check if data already exists
    # Define 3 admin credentials
    admins_to_create = [
        {"username": "admin1", "password": "pass123"},
        {"username": "admin2", "password": "pass456"},
        {"username": "admin3", "password": "pass789"}
    ]

    # Create verify table if it doesn't exist (ensure all tables created)
    models.Base.metadata.create_all(bind=engine)

    for admin_data in admins_to_create:
        existing_admin = db.query(models.Admin).filter(models.Admin.username == admin_data["username"]).first()
        if existing_admin:
            print(f"Admin user '{admin_data['username']}' already exists.")
        else:
            print(f"Creating admin user '{admin_data['username']}'...")
            hashed_pwd = Hash.bcrypt(admin_data["password"])
            new_admin = models.Admin(username=admin_data["username"], hashed_password=hashed_pwd)
            db.add(new_admin)
            db.commit()
            print(f"Admin created: {admin_data['username']}")

    if db.query(models.Item).first():
        print("Item data already exists. Skipping item seed.")
    else:
         items = [
            models.Item(name="Item 1", description="Description for Item 1"),
            models.Item(name="Item 2", description="Description for Item 2"),
            models.Item(name="Item 3", description="Description for Item 3"),
        ]
         db.add_all(items)
         db.commit()
         print("Item data seeded successfully!")

    db.close()

if __name__ == "__main__":
    seed_data()
