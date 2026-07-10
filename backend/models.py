from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, index=True)
    longitude = Column(Float, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    data = Column(String)
