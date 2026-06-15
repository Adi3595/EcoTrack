from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api import deps
from models.user import User
from models.activity import Activity
from models.emission import Emission
from schemas.activity import ActivityCreate, ActivityResponse

router = APIRouter()

# Basic Emission Factors for MVP
EMISSION_FACTORS = {
    "TRANSPORT": 0.2, # kg CO2 per km
    "ELECTRICITY": 0.4, # kg CO2 per kWh
    "FOOD": 2.0, # kg CO2 per meal
}

@router.post("/", response_model=ActivityResponse)
def create_activity(
    activity_in: ActivityCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    activity = Activity(
        user_id=current_user.id,
        activity_type=activity_in.activity_type,
        description=activity_in.description,
        value=activity_in.value,
        unit=activity_in.unit,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    
    # Calculate emissions
    factor = EMISSION_FACTORS.get(activity.activity_type.upper(), 1.0)
    co2 = activity.value * factor
    
    emission = Emission(
        activity_id=activity.id,
        user_id=current_user.id,
        co2_amount=co2,
        calculation_method="STANDARD_FACTOR"
    )
    db.add(emission)
    
    # Update user score (just an example accumulation)
    current_user.carbon_score += co2
    db.add(current_user)
    
    db.commit()
    return activity

@router.get("/", response_model=list[ActivityResponse])
def get_activities(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    return db.query(Activity).filter(Activity.user_id == current_user.id).all()

from schemas.activity import CompleteTaskRequest, TaskCompletionResponse

@router.post("/complete-task", response_model=TaskCompletionResponse)
def complete_task(
    req: CompleteTaskRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # In a real app with Groq Vision, we would decode req.proof_base64 and analyze it here
    
    # Award gamification points
    current_user.xp += req.reward_xp
    current_user.carbon_score += req.reward_carbon
    
    # Check for level up (every 500 XP = 1 Level)
    new_level = (current_user.xp // 500) + 1
    if new_level > current_user.level:
        current_user.level = new_level
        
    db.add(current_user)
    db.commit()
    
    return TaskCompletionResponse(
        status="success",
        message=f"Verified! You earned {req.reward_xp} XP.",
        xp_earned=req.reward_xp,
        carbon_saved=req.reward_carbon,
        new_total_xp=current_user.xp,
        new_total_carbon=current_user.carbon_score
    )
