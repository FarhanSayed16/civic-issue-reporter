# File: E:/civic-issue-reporter/apps/api/main.py

from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine

app = FastAPI()

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/issues/", response_model=schemas.Issue)
def create_issue(issue: schemas.IssueCreate, db: Session = Depends(get_db)):
    # Create a new SQLAlchemy model instance from the API data
    db_issue = models.Issue(
        description=issue.description,
        latitude=issue.latitude,
        longitude=issue.longitude
    )
    db.add(db_issue)  # Add the new issue to the session
    db.commit()      # Commit the transaction to the database
    db.refresh(db_issue) # Refresh the instance to get the new ID
    return db_issue

@app.get("/issues/", response_model=list[schemas.Issue])
def read_issues(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    issues = db.query(models.Issue).offset(skip).limit(limit).all()
    return issues