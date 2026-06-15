import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Gamification
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    # Sustainability Profile
    carbon_score = Column(Float, default=0.0) # Calculated score
    
    # Integrations
    google_id = Column(String, unique=True, index=True, nullable=True)
    fcm_token = Column(String, nullable=True)
