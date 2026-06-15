from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime

class ActivityCreate(BaseModel):
    activity_type: str
    description: Optional[str] = None
    value: float
    unit: str

class ActivityResponse(BaseModel):
    id: UUID
    activity_type: str
    description: Optional[str]
    value: float
    unit: str
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CompleteTaskRequest(BaseModel):
    task_id: str
    task_title: str
    proof_base64: Optional[str] = None
    reward_xp: int = 50
    reward_carbon: float = 5.0

class TaskCompletionResponse(BaseModel):
    status: str
    message: str
    xp_earned: int
    carbon_saved: float
    new_total_xp: int
    new_total_carbon: float
