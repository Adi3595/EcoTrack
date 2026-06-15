from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class QuestCreate(BaseModel):
    title: str
    description: str
    reward_xp: int
    max_progress: int = 1

class QuestResponse(BaseModel):
    id: UUID
    title: str
    description: str
    reward_xp: int
    max_progress: int
    creator_id: UUID
    created_at: datetime
    current_progress: Optional[int] = 0
    is_joined: bool = False

    class Config:
        orm_mode = True

class DailyTaskResponse(BaseModel):
    id: str
    title: str
    reward_xp: int
    reward_carbon: float
    completed: bool
    locked_until: Optional[datetime] = None

class CompleteTaskRequest(BaseModel):
    task_id: str
    task_title: str
    proof_base64: str
    reward_xp: int
    reward_carbon: float
