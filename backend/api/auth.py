from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from api import deps
from core.security import verify_password, get_password_hash, create_access_token, limiter
from models.user import User
from models.notification import PasswordResetToken
from schemas.user import UserCreate, UserResponse, Token
from core.config import settings
from pydantic import BaseModel
from fastapi import Request
import uuid

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    email: str
    full_name: str
    google_id: str

class ForgotPasswordRequest(BaseModel):
    email: str

from pydantic import BaseModel, Field

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

@router.post("/register", response_model=UserResponse)
@limiter.limit("3/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="The user with this username already exists in the system.")
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
    }

@router.post("/google", response_model=Token)
@limiter.limit("5/minute")
def google_login(request: Request, req: GoogleLoginRequest, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Auto-create user for Google Login
        user = User(
            email=req.email,
            full_name=req.full_name,
            google_id=req.google_id,
            hashed_password=get_password_hash(uuid.uuid4().hex) # Random password, they use Google
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
    }

@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, req: ForgotPasswordRequest, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not registered. Please register first.")
    
    # Invalidate old tokens
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).update({"is_used": True})
    
    token = uuid.uuid4().hex
    reset_token = PasswordResetToken(user_id=user.id, token=token)
    db.add(reset_token)
    db.commit()
    
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    if settings.RESEND_API_KEY:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        
        html = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>Hi {user.full_name or 'Eco Warrior'},</p>
                <p>We received a request to reset your password. Click the link below to set a new one:</p>
                <p><a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                <p>If you didn't request this, you can safely ignore this email.</p>
            </body>
        </html>
        """
        
        try:
            r = resend.Emails.send({
                "from": "EcoTrack <onboarding@resend.dev>",
                "to": user.email,
                "subject": "Reset your EcoTrack Password",
                "html": html
            })
            print(f"Resend sent successfully: {r}")
        except Exception as e:
            print(f"Failed to send email via Resend: {e}")
            print(f"FALLBACK - Reset Link for {user.email}: {reset_link}")
            return {"status": "success", "message": "Email sending failed. Link printed to backend logs for testing."}
            
        return {"status": "success", "message": "Password reset email sent."}
    else:
        # Fallback for local development when SMTP is not configured
        print(f"RESEND_API_KEY not configured. FALLBACK - Reset Link for {user.email}: {reset_link}")
        return {"status": "success", "message": "SMTP not configured. Link printed to backend logs for local testing."}

@router.post("/reset-password")
@limiter.limit("3/minute")
def reset_password(request: Request, req: ResetPasswordRequest, db: Session = Depends(deps.get_db)):
    from datetime import datetime
    reset_token = db.query(PasswordResetToken).filter(PasswordResetToken.token == req.token, PasswordResetToken.is_used == False).first()
    
    if not reset_token or reset_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
        
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    user.hashed_password = get_password_hash(req.new_password)
    reset_token.is_used = True
    
    db.commit()
    return {"status": "success"}

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(deps.get_current_user)):
    return current_user
