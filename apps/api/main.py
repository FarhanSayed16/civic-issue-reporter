# File: E:/civic-reporter/apps/api/main.py

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Civic Issue API is running!"}