from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from models.travel import TravelSession, TravelRoute
from api.deps import get_current_user, get_db
from pydantic import BaseModel
import math

router = APIRouter()

class StartSessionRequest(BaseModel):
    vehicle_type: str

class EndSessionRequest(BaseModel):
    session_id: str

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Emission factors (kg CO2 per km)
EMISSION_FACTORS = {
    "Gas Car": 0.192,
    "Diesel Car": 0.171,
    "EV": 0.05,
    "Bus": 0.082,
    "Train": 0.041,
    "Bike": 0.0,
    "Walking": 0.0,
}

@router.post("/session/start")
def start_travel_session(req: StartSessionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = TravelSession(
        user_id=current_user.id,
        vehicle_type=req.vehicle_type,
        is_active=True
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": str(session.id)}

@router.post("/session/end")
def end_travel_session(req: EndSessionRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(TravelSession).filter(TravelSession.id == req.session_id, TravelSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.is_active = False
    
    # Calculate totals
    routes = db.query(TravelRoute).filter(TravelRoute.session_id == session.id).order_by(TravelRoute.timestamp).all()
    total_dist = 0.0
    for i in range(1, len(routes)):
        total_dist += haversine(routes[i-1].lat, routes[i-1].lng, routes[i].lat, routes[i].lng)
        
    session.total_distance = total_dist
    factor = EMISSION_FACTORS.get(session.vehicle_type, 0.1)
    session.total_emissions = total_dist * factor
    
    db.commit()
    
    return {
        "status": "success",
        "total_distance": round(total_dist, 2),
        "total_emissions": round(session.total_emissions, 2)
    }

@router.get("/analytics")
def get_travel_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(TravelSession).filter(TravelSession.user_id == current_user.id).all()
    
    total_distance = sum(s.total_distance for s in sessions)
    total_emissions = sum(s.total_emissions for s in sessions)
    
    vehicle_breakdown = {}
    for s in sessions:
        vehicle_breakdown[s.vehicle_type] = vehicle_breakdown.get(s.vehicle_type, 0) + s.total_distance

    return {
        "total_distance": total_distance,
        "total_emissions": total_emissions,
        "vehicle_breakdown": vehicle_breakdown,
        "recent_sessions": [{"id": s.id, "vehicle_type": s.vehicle_type, "distance": s.total_distance, "emissions": s.total_emissions, "date": s.start_time} for s in sessions[-5:]]
    }
