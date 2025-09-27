from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Configure SQLite for better compatibility
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, 
    echo=False, 
    future=True,
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables"""
    from app.models import User, Issue, Upvote
    Base.metadata.create_all(bind=engine)
    # Lightweight migrations for SQLite: add missing columns if needed
    try:
        if settings.DATABASE_URL.startswith("sqlite"):
            with engine.connect() as conn:
                cols = conn.exec_driver_sql("PRAGMA table_info(issues)").fetchall()
                col_names = {c[1] for c in cols}
                if "is_anonymous" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN is_anonymous BOOLEAN DEFAULT 0")
                # Address columns
                if "address_line1" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN address_line1 VARCHAR(200)")
                if "address_line2" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN address_line2 VARCHAR(200)")
                if "street" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN street VARCHAR(100)")
                if "landmark" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN landmark VARCHAR(100)")
                if "pincode" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN pincode VARCHAR(20)")
                if "is_verified" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN is_verified BOOLEAN DEFAULT 1")
                if "severity_score" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE issues ADD COLUMN severity_score FLOAT DEFAULT 0.5")
                
                # Check users table for profile picture
                user_cols = conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()
                user_col_names = {c[1] for c in user_cols}
                if "profile_picture_url" not in user_col_names:
                    conn.exec_driver_sql("ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500)")
    except Exception:
        # Best-effort migration; ignore if fails
        pass
