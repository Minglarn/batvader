import contextlib
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import requests
import models
from database import engine, get_db
import json
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import math

models.Base.metadata.create_all(bind=engine)

# Default Trosa coordinates
DEFAULT_LAT = 58.8986
DEFAULT_LON = 17.5504

watched_locations = {(DEFAULT_LAT, DEFAULT_LON)}

def fetch_smhi_data(lat: float, lon: float):
    lat_str = f"{lat:.4f}"
    lon_str = f"{lon:.4f}"
    url = f"https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/{lon_str}/lat/{lat_str}/data.json"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching data from SMHI: {e}")
        return None

def update_weather_job():
    print(f"[{datetime.datetime.now()}] Running background job to fetch weather...")
    db = models.SessionLocal()
    for lat, lon in watched_locations:
        data = fetch_smhi_data(lat, lon)
        if data:
            weather_record = models.WeatherData(
                latitude=lat,
                longitude=lon,
                data=json.dumps(data)
            )
            db.add(weather_record)
            print(f"Saved weather data for {lat}, {lon}")
    db.commit()
    db.close()

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(update_weather_job, 'cron', minute=0)
    scheduler.start()
    
    db = models.SessionLocal()
    count = db.query(models.WeatherData).count()
    db.close()
    if count == 0:
        update_weather_job()
        
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@app.get("/api/weather")
def get_weather(lat: float = DEFAULT_LAT, lon: float = DEFAULT_LON, db: Session = Depends(get_db)):
    is_watched = False
    target_lat = lat
    target_lon = lon
    
    for w_lat, w_lon in watched_locations:
        if haversine_distance(lat, lon, w_lat, w_lon) < 5:
            is_watched = True
            target_lat = w_lat
            target_lon = w_lon
            break
            
    if not is_watched:
        watched_locations.add((lat, lon))
        data = fetch_smhi_data(lat, lon)
        if data:
            weather_record = models.WeatherData(
                latitude=lat,
                longitude=lon,
                data=json.dumps(data)
            )
            db.add(weather_record)
            db.commit()

    latest = db.query(models.WeatherData)\
        .filter(models.WeatherData.latitude == target_lat, models.WeatherData.longitude == target_lon)\
        .order_by(models.WeatherData.timestamp.desc())\
        .first()

    if latest:
        return json.loads(latest.data)
    return {"error": "Data ej tillgänglig"}
