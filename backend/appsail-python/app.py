from fastapi import FastAPI
import uvicorn
import os
from sqlalchemy import create_engine, text

app = FastAPI()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"},
    pool_pre_ping=True
)

@app.get('/')
def index():
    return 'Web App with Python FastAPI!'

listen_port = int(os.getenv('X_ZOHO_CATALYST_LISTEN_PORT', 8000))

@app.get("/test-db")
def test_db():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": "connected", "result": result.scalar()}

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=listen_port)
