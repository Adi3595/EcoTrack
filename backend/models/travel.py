import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base_class import Base

class TravelSession(Base):
    __tablename__ = "travel_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    vehicle_type = Column(String, nullable=False) # e.g., EV, Gas Car, Bike, Train
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_distance = Column(Float, default=0.0) # In km
    total_emissions = Column(Float, default=0.0) # In kg CO2
    is_active = Column(Boolean, default=True)

    routes = relationship("TravelRoute", back_populates="session", cascade="all, delete-orphan")

class TravelRoute(Base):
    __tablename__ = "travel_routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("travel_sessions.id"), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("TravelSession", back_populates="routes")
