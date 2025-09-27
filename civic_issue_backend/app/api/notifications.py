from fastapi import APIRouter, WebSocket, Depends, Query, HTTPException
from app.core.websocket import manager
from app.core.security import get_current_user
from app.core.db import get_db
from sqlalchemy.orm import Session
from app.models.user import User

router = APIRouter()

@router.websocket("/ws/updates/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, token: str = Query(...)):
    """WebSocket for user-specific live updates with authentication"""
    print(f"WebSocket connection attempt for user {user_id}")
    try:
        # Validate JWT token
        if not token:
            print("No token provided")
            await websocket.close(code=1008, reason="No token provided")
            return
        
        # Decode JWT token to get user info
        try:
            from jose import jwt
            from app.core.config import settings
            
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            token_user_id = int(payload.get("sub"))
            
            print(f"Token user ID: {token_user_id}, URL user ID: {user_id}")
            
            # Verify the user_id in URL matches the token
            if token_user_id != user_id:
                print("User ID mismatch")
                await websocket.close(code=1008, reason="User ID mismatch")
                return
                
        except Exception as e:
            print(f"JWT validation error: {e}")
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        print(f"Accepting WebSocket connection for user {user_id}")
        await websocket.accept()
        await manager.connect(websocket, user_id)
        
        await websocket.send_json({"message": f"Connected to updates for user {user_id}"})
        
        try:
            while True:
                data = await websocket.receive_text()
                # Echo back for testing, in production this would handle specific commands
                await websocket.send_json({"user_id": user_id, "message": data})
        except Exception as e:
            print(f"WebSocket connection error: {e}")
            await manager.disconnect(websocket, user_id)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket, user_id)

@router.websocket("/updates/{issue_id}")
async def issue_websocket_endpoint(websocket: WebSocket, issue_id: int):
    """WebSocket for issue-specific updates (legacy support)"""
    await manager.connect(websocket)
    try:
        await websocket.send_json({"message": f"Subscribed to updates for issue {issue_id}"})
        while True:
            data = await websocket.receive_text()
            await manager.broadcast({"issue_id": issue_id, "message": data})
    except Exception:
        await manager.disconnect(websocket)
