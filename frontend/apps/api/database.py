# File: E:/civic-reporter/apps/api/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from configparser import ConfigParser # <-- Import this

# This function reads the alembic.ini file to get the database URL
def get_database_url_from_alembic():
    config = ConfigParser()
    config.read('alembic.ini') # Assumes alembic.ini is in the same folder
    return config.get('alembic', 'sqlalchemy.url')

# Use the function to get the URL
DATABASE_URL = get_database_url_from_alembic()

if not DATABASE_URL:
    raise ValueError("Could not read DATABASE_URL from alembic.ini")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()