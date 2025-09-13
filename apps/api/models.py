# models.py
from sqlalchemy import Column, Integer, String, Float
from database import Base

class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    status = Column(String, default="new")
    latitude = Column(Float)
    longitude = Column(Float)