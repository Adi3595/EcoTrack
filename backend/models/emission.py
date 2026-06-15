import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base_class import Base

class Emission(Base):
    __tablename__ = "emissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    activity_id = Column(UUID(as_uuid=True), ForeignKey("activities.id"), nullable=False, unique=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    co2_amount = Column(Float, nullable=False) # in kg CO2
    calculation_method = Column(String) # e.g., AI, STANDARD_FACTOR
    timestamp = Column(DateTime, default=datetime.utcnow)

    activity = relationship("Activity", back_populates="emission")
    user = relationship("User", backref="emissions")
