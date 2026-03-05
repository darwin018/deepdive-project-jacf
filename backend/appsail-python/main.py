from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def index():
    return {"message": "Web App with Python FastAPI!"}