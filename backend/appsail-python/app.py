from fastapi import FastAPI, Depends
import uvicorn
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api import auth, categories, products, orders
from app import models, database
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

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

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(orders.router)

# Provide fallback directory for static files if starting from appsail-python
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get('/')
def index():
    return 'Web App with Python FastAPI!'

from sqlalchemy.orm import Session
from sqlalchemy import text

@app.get("/db-health")
def db_health(db: Session = Depends(database.get_db)):
    try:
        # Execute a simple query to verify connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "Database connected successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == '__main__':
    listen_port = int(os.getenv('X_ZOHO_CATALYST_LISTEN_PORT', 9000))
    uvicorn.run(app, host='0.0.0.0', port=listen_port)
