import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from api.deps import get_db, get_current_user
from models.user import User
from models.notification import Notification
import firebase_admin
from firebase_admin import credentials, messaging

router = APIRouter()

# Initialize Firebase Admin
# In production, use a valid service account JSON file.
try:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
except Exception as e:
    print("Warning: Firebase Admin not initialized properly.", e)

class TokenRequest(BaseModel):
    fcm_token: str

@router.post("/token")
def register_token(req: TokenRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.fcm_token = req.fcm_token
    db.commit()
    return {"status": "success", "message": "FCM token registered successfully"}

@router.get("/")
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.timestamp.desc()).limit(20).all()
    return notifications

def send_in_app_notification(db: Session, user_id: str, title: str, message: str):
    """
    Utility to save an in-app notification and optionally trigger an FCM push notification.
    """
    notification = Notification(user_id=user_id, title=title, message=message)
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Attempt to send via Firebase Cloud Messaging
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.fcm_token:
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=message,
                ),
                token=user.fcm_token,
            )
            response = messaging.send(message)
            print('Successfully sent message:', response)
        except Exception as e:
            print("Failed to send FCM push notification:", e)
            
    return notification
