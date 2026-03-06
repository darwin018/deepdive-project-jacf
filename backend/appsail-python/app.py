from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def index():
    return {"message": "FastAPI running on Zoho Catalyst"}