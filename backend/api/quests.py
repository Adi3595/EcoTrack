from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import os
import json
from openai import AsyncOpenAI

from api import deps
from models.user import User
from models.quest import Quest, UserQuest, UserTaskLog
from schemas.quest import QuestCreate, QuestResponse, DailyTaskResponse, CompleteTaskRequest

router = APIRouter()

TASKS_POOL = [
    {"id": "t1", "title": "Use a reusable coffee cup", "reward_xp": 50, "reward_carbon": 2.0},
    {"id": "t2", "title": "Walk or bike to work", "reward_xp": 100, "reward_carbon": 5.0},
    {"id": "t3", "title": "Plant a tree or garden", "reward_xp": 200, "reward_carbon": 10.0},
    {"id": "t4", "title": "Eat a plant-based meal", "reward_xp": 80, "reward_carbon": 4.0},
    {"id": "t5", "title": "Line dry clothes", "reward_xp": 60, "reward_carbon": 3.5},
    {"id": "t6", "title": "Compost food scraps", "reward_xp": 70, "reward_carbon": 1.5},
    {"id": "t7", "title": "Turn off unused lights", "reward_xp": 30, "reward_carbon": 1.0},
]

@router.get("/daily", response_model=list[DailyTaskResponse])
def get_daily_tasks(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Stable random daily seed (YYYY-MM-DD)
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    random.seed(today_str)
    
    selected_tasks = random.sample(TASKS_POOL, 3)
    
    # Check cooldowns in database
    now = datetime.utcnow()
    response_tasks = []
    
    for task in selected_tasks:
        log = db.query(UserTaskLog).filter(
            UserTaskLog.user_id == current_user.id,
            UserTaskLog.task_id == task["id"]
        ).order_by(UserTaskLog.completed_at.desc()).first()
        
        completed = False
        locked_until = None
        
        if log:
            diff = now - log.completed_at
            if diff < timedelta(hours=24):
                completed = True
                locked_until = log.completed_at + timedelta(hours=24)
                
        response_tasks.append({
            "id": task["id"],
            "title": task["title"],
            "reward_xp": task["reward_xp"],
            "reward_carbon": task["reward_carbon"],
            "completed": completed,
            "locked_until": locked_until
        })
        
    return response_tasks


@router.post("/daily/complete")
async def complete_daily_task(
    req: CompleteTaskRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    # Check cooldown
    now = datetime.utcnow()
    log = db.query(UserTaskLog).filter(
        UserTaskLog.user_id == current_user.id,
        UserTaskLog.task_id == req.task_id
    ).order_by(UserTaskLog.completed_at.desc()).first()
    
    if log and (now - log.completed_at) < timedelta(hours=24):
        raise HTTPException(status_code=400, detail="Task is currently on cooldown (24h lock)")

    # ---------------- AI VISION VERIFICATION ---------------- #
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
        
    client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    
    prompt = f"""
    The user claims to have completed the eco-friendly task: "{req.task_title}".
    Look at the uploaded image proof. Does the image reasonably prove this task was completed?
    (e.g. if the task is 'use a reusable coffee cup', the image must contain a coffee cup).
    Return ONLY a valid JSON object matching exactly:
    {{"verified": true/false, "reason": "short explanation"}}
    """
    
    # Strip data URI prefix if present
    base64_img = req.proof_base64
    if base64_img.startswith("data:image"):
        base64_img = base64_img.split(",")[1]

    try:
        response = await client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_img}"}}
                    ]
                }
            ],
            temperature=0.1,
            max_tokens=200
        )
        
        raw_output = response.choices[0].message.content
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:-3]
        elif raw_output.startswith("```"):
            raw_output = raw_output[3:-3]
            
        data = json.loads(raw_output.strip())
        
        if not data.get("verified", False):
            raise HTTPException(status_code=400, detail=f"AI Verification Failed: {data.get('reason', 'Image does not match task.')}")
            
    except json.JSONDecodeError:
        print("Failed to parse Groq vision response:", raw_output)
        raise HTTPException(status_code=500, detail="Failed to verify image with AI.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        print("Groq Vision API Error:", str(e))
        raise HTTPException(status_code=500, detail="AI Vision API error during verification.")
    # -------------------------------------------------------- #
        
    # Log task
    new_log = UserTaskLog(user_id=current_user.id, task_id=req.task_id, completed_at=now)
    db.add(new_log)
    
    # Award gamification points
    current_user.xp += req.reward_xp
    current_user.carbon_score += req.reward_carbon
    
    # Check for level up (every 500 XP = 1 Level)
    new_level = (current_user.xp // 500) + 1
    if new_level > current_user.level:
        current_user.level = new_level
        
    db.add(current_user)
    db.commit()
    
    return {
        "status": "success",
        "message": f"Verified! You earned {req.reward_xp} XP.",
        "xp_earned": req.reward_xp,
        "carbon_saved": req.reward_carbon,
        "new_total_xp": current_user.xp,
        "new_total_carbon": current_user.carbon_score
    }


@router.get("/", response_model=list[QuestResponse])
def get_all_quests(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    quests = db.query(Quest).order_by(Quest.created_at.desc()).all()
    user_quests = {uq.quest_id: uq.current_progress for uq in current_user.joined_quests}
    
    response = []
    for q in quests:
        resp = QuestResponse.from_orm(q)
        if q.id in user_quests:
            resp.is_joined = True
            resp.current_progress = user_quests[q.id]
        else:
            resp.is_joined = False
            resp.current_progress = 0
        response.append(resp)
        
    return response


@router.post("/", response_model=QuestResponse)
def create_quest(
    quest_in: QuestCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    new_quest = Quest(
        title=quest_in.title,
        description=quest_in.description,
        reward_xp=quest_in.reward_xp,
        max_progress=quest_in.max_progress,
        creator_id=current_user.id
    )
    db.add(new_quest)
    db.commit()
    db.refresh(new_quest)
    
    return QuestResponse(
        id=new_quest.id,
        title=new_quest.title,
        description=new_quest.description,
        reward_xp=new_quest.reward_xp,
        max_progress=new_quest.max_progress,
        creator_id=new_quest.creator_id,
        created_at=new_quest.created_at,
        current_progress=0,
        is_joined=False
    )


@router.post("/{quest_id}/join")
def join_quest(
    quest_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    existing = db.query(UserQuest).filter_by(user_id=current_user.id, quest_id=quest_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this quest")
        
    user_quest = UserQuest(user_id=current_user.id, quest_id=quest_id)
    db.add(user_quest)
    db.commit()
    return {"status": "success", "message": "Successfully joined quest"}

@router.post("/{quest_id}/progress")
def increment_quest_progress(
    quest_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    uq = db.query(UserQuest).filter_by(user_id=current_user.id, quest_id=quest_id).first()
    if not uq:
        raise HTTPException(status_code=404, detail="You must join the quest first")
        
    if uq.current_progress < uq.quest.max_progress:
        uq.current_progress += 1
        db.add(uq)
        
        # If completed, award XP
        if uq.current_progress == uq.quest.max_progress:
            current_user.xp += uq.quest.reward_xp
            new_level = (current_user.xp // 500) + 1
            if new_level > current_user.level:
                current_user.level = new_level
            db.add(current_user)
            
        db.commit()
        
    return {"status": "success", "current_progress": uq.current_progress}
