from fastapi import FastAPI

app = FastAPI()

@app.get('/')
def read_root():
    return {"message": "Welcome to the Hackathon FastAPI backend!"}

@app.get('/api/hello')
def hello():
    return {"message": "Hello from FastAPI 🚀"}