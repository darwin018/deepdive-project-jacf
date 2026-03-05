from fastapi import FastAPI
import uvicorn
import os
from sqlalchemy import create_engine, text

app = FastAPI()



@app.get('/')
def index():
    return 'Web App with Python FastAPI!'


