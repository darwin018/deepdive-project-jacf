from fastapi import FastAPI
import uvicorn
import os

app = FastAPI()

@app.get('/')
def index():
    return 'Web App with Python FastAPI!'

listen_port = int(os.getenv('X_ZOHO_CATALYST_LISTEN_PORT', 9000))

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=listen_port)
