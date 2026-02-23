print("Starting init_db script...")
from app.database import engine, Base
from app.models import *

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")
