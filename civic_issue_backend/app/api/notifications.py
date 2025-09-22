from fastapi import APIRouter, WebSocket, Depends
from app.core.websocket import manager
from app.core.security import get_current_user

router = APIRouter()

@router.websocket("/ws/updates/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket for user-specific live updates"""
    await manager.connect(websocket, user_id)
    try:
        await websocket.send_json({"message": f"Connected to updates for user {user_id}"})
        while True:
            data = await websocket.receive_text()
            # Echo back for testing, in production this would handle specific commands
            await websocket.send_json({"user_id": user_id, "message": data})
    except Exception:
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
