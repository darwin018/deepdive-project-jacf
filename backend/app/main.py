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
        
        # New order fields
        db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS state VARCHAR"))
        db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS city VARCHAR"))
        db.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS pincode VARCHAR"))
        
        db.commit()
        return {"status": "success", "message": "Migrated successfully!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/debug_products")
def debug_products(db: Session = Depends(database.get_db)):
    import traceback
    try:
        from .models import product as models_product
        from .schemas.product import Product as ProductSchema
        products = db.query(models_product.Product).limit(5).all()
        result = []
        for p in products:
            try:
                validated = ProductSchema.model_validate(p)
                result.append({"ok": True, "id": p.id, "data": validated.model_dump()})
            except Exception as e:
                result.append({"ok": False, "id": p.id, "error": str(e), "raw": {
                    "name": repr(p.name), "description": repr(p.description),
                    "quantity": repr(p.quantity), "actual_price": repr(p.actual_price),
                    "offer_price": repr(p.offer_price), "category_id": repr(p.category_id),
                    "image_url": repr(p.image_url)
                }})
        return {"status": "debug", "results": result}
    except Exception as e:
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}
