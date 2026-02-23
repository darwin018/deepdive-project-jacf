from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from . import models, database
from .api import auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

