import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base_class import Base

class ShoppingProduct(Base):
    __tablename__ = "shopping_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    image_url = Column(String)
    name = Column(String, nullable=False)
    category = Column(String)
    carbon_footprint = Column(Float) # Estimated CO2 in kg
    eco_rating = Column(String) # e.g., A, B, C, D, F
    timestamp = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("ShoppingAnalysis", back_populates="product", uselist=False)

class ShoppingAnalysis(Base):
    __tablename__ = "shopping_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("shopping_products.id"), nullable=False, unique=True)
    manufacturing_impact = Column(Float)
    packaging_impact = Column(Float)
    transport_impact = Column(Float)
    alternatives_json = Column(JSON) # List of alternative suggestions
    insights_json = Column(JSON) # AI generated insights

    product = relationship("ShoppingProduct", back_populates="analysis")
