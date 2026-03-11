from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from . import models, database
from .api import auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()



from fastapi.staticfiles import StaticFiles
from .api import auth, categories, products, orders
from .models import order # Import to ensure tables are created

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return {"message": "Faaaaaah"}

@app.get("/db-health")
def db_health(db: Session = Depends(database.get_db)):
    try:
        # Execute a simple query to verify connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "Database connected successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/migrate_db")
def run_db_migration(db: Session = Depends(database.get_db)):
    try:
        # Check if columns exist first by catching exception or just run and allow failure if they exist
        db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_data BYTEA"))
        db.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS image_mime_type VARCHAR"))
        db.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_data BYTEA"))
        db.execute(text("ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_mime_type VARCHAR"))
        db.commit()
        return {"status": "success", "message": "Migrated successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
