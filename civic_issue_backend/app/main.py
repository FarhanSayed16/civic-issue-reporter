from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.core.encryption import get_key_b64, AAD_VALUE
from app.api import auth, issues, users, notifications, admin, analytics, ai, messages
from app.core.db import create_tables

app = FastAPI(title="Civic Issue Reporting Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    try:
        create_tables()
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")

# Mount static files for frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(issues.router, prefix="/issues", tags=["Issues"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/admin", tags=["Admin Dashboard"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(messages.router, prefix="/messages", tags=["Messages"])

@app.get("/")
def root():
    return {"message": "Civic Issue Backend Running"}

@app.get("/frontend")
async def frontend():
    """Serve the frontend HTML"""
    return FileResponse("static/index.html")

@app.get("/encryption/config")
async def encryption_config():
    return JSONResponse({
        "key_b64": get_key_b64(),
        "aad": AAD_VALUE.decode('ascii')
    })
