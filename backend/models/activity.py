import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base_class import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    activity_type = Column(String, nullable=False) # e.g., TRANSPORT, ELECTRICITY, FOOD, SHOPPING
    description = Column(String)
    value = Column(Float, nullable=False) # e.g., distance, kWh
    unit = Column(String, nullable=False) # e.g., km, kWh
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="activities")
    emission = relationship("Emission", back_populates="activity", uselist=False)
