from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
from db.session import SessionLocal
from models.travel import TravelSession, TravelRoute
from api.travel import haversine, EMISSION_FACTORS

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.travel_sessions: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

manager = ConnectionManager()

@router.websocket("/ws/travel/{session_id}")
async def websocket_travel(websocket: WebSocket, session_id: str):
    await manager.connect(websocket)
    db = SessionLocal()
    
    try:
        session = db.query(TravelSession).filter(TravelSession.id == session_id).first()
        if not session:
            await websocket.close(code=4004)
            return
            
        vehicle_type = session.vehicle_type
        factor = EMISSION_FACTORS.get(vehicle_type, 0.1)

        last_route = db.query(TravelRoute).filter(TravelRoute.session_id == session.id).order_by(TravelRoute.timestamp.desc()).first()
        
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            lat = payload.get("lat")
            lng = payload.get("lng")
            
            if lat and lng:
                new_route = TravelRoute(session_id=session.id, lat=lat, lng=lng)
                db.add(new_route)
                
                dist_increment = 0.0
                if last_route:
                    dist_increment = haversine(last_route.lat, last_route.lng, lat, lng)
                    
                session.total_distance += dist_increment
                session.total_emissions += dist_increment * factor
                db.commit()
                
                last_route = new_route
                
                await websocket.send_text(json.dumps({
                    "total_distance": round(session.total_distance, 2),
                    "total_emissions": round(session.total_emissions, 2)
                }))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()
