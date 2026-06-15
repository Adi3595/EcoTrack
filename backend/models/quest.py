import uuid
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from db.base_class import Base

class Quest(Base):
    __tablename__ = "quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    reward_xp = Column(Integer, nullable=False)
    max_progress = Column(Integer, nullable=False, default=1)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", backref="created_quests")
    participants = relationship("UserQuest", back_populates="quest")


class UserQuest(Base):
    __tablename__ = "user_quests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    quest_id = Column(UUID(as_uuid=True), ForeignKey("quests.id"), nullable=False)
    current_progress = Column(Integer, default=0)
    joined_at = Column(DateTime, default=datetime.utcnow)

    quest = relationship("Quest", back_populates="participants")
    user = relationship("User", backref="joined_quests")


class UserTaskLog(Base):
    __tablename__ = "user_task_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    task_id = Column(String, nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
