import contextlib
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import requests
import models
from database import engine, get_db, SessionLocal
import json
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import datetime
import math

models.Base.metadata.create_all(bind=engine)

# Default Trosa coordinates
DEFAULT_LAT = 58.8986
DEFAULT_LON = 17.5504

watched_locations = {(DEFAULT_LAT, DEFAULT_LON)}

def get_location_name(lat: float, lon: float):
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    headers = {"User-Agent": "BatVader/1.0 github.com/Minglarn/batvader"}
    try:
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            addr = data.get("address", {})
            return addr.get("village") or addr.get("town") or addr.get("city") or addr.get("municipality") or "Okänd plats"
    except Exception as e:
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ERROR: Nominatim reverse geocoding misslyckades: {e}", flush=True)
    return "Okänd plats"

def fetch_weather_data(lat: float, lon: float):
    lat_str = f"{lat:.4f}"
    lon_str = f"{lon:.4f}"
    smhi_url = f"https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/{lon_str}/lat/{lat_str}/data.json"
    ocean_url = f"https://api.met.no/weatherapi/oceanforecast/2.0/complete?lat={lat}&lon={lon}"
    
    smhi_data = None
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] HÄMTAR DATA: SMHI API för koordinater {lat_str}, {lon_str}...", flush=True)
    try:
        response = requests.get(smhi_url, timeout=10)
        response.raise_for_status()
        smhi_data = response.json()
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] SUCCESS: SMHI data hämtad.", flush=True)
    except Exception as e:
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ERROR: Kunde inte hämta från SMHI: {e}", flush=True)
        return None
        
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] HÄMTAR DATA: MET Norway Oceanforecast för koordinater {lat_str}, {lon_str}...", flush=True)
    try:
        headers = {"User-Agent": "BatVader/1.0 github.com/Minglarn/batvader"}
        res = requests.get(ocean_url, headers=headers, timeout=10)
        res.raise_for_status()
        ocean_data = res.json()
        ts = ocean_data.get("properties", {}).get("timeseries", [])
        if ts:
            ocean_map = {item["time"]: item.get("data", {}).get("instant", {}).get("details", {}) for item in ts if "time" in item}
            for hour in smhi_data.get("timeSeries", []):
                t = hour.get("validTime")
                details = ocean_map.get(t, {})
                if "data" not in hour:
                    hour["data"] = {}
                hour["data"]["sea_water_temperature"] = details.get("sea_water_temperature", "-")
                hour["data"]["ocean_wave_height"] = details.get("sea_surface_wave_height", "-")
                hour["data"]["ocean_wave_direction"] = details.get("sea_surface_wave_from_direction", "-")
                hour["data"]["ocean_velocity"] = details.get("sea_water_speed", "-")
                hour["data"]["ocean_direction"] = details.get("sea_water_to_direction", "-")
                hour["time"] = t  # Se till att frontend kan använda 'time'
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] SUCCESS: MET Norway data hämtad och inbakad.", flush=True)
    except Exception as e:
        print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ERROR: Kunde inte hämta ocean data från MET Norway: {e}", flush=True)
        
    smhi_data["location_name"] = get_location_name(lat, lon)
    return smhi_data

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

async def update_weather_job():
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Kör bakgrundsjobb för att hämta väder...", flush=True)
    db = SessionLocal()
    for lat, lon in watched_locations:
        data = fetch_weather_data(lat, lon)
        if data:
            weather_record = models.WeatherData(
                latitude=lat,
                longitude=lon,
                data=json.dumps(data)
            )
            db.add(weather_record)
            print(f"Saved weather data for {lat}, {lon}", flush=True)
            await manager.broadcast(json.dumps(data))
    db.commit()
    db.close()

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    print("░████████      ░███    ░██████████░██    ░██    ░███    ░███████   ░██████████ ░█████████  ", flush=True)
    print("░██    ░██    ░██░██       ░██    ░██    ░██   ░██░██   ░██   ░██  ░██         ░██     ░██ ", flush=True)
    print("░██    ░██   ░██  ░██      ░██    ░██    ░██  ░██  ░██  ░██    ░██ ░██         ░██     ░██ ", flush=True)
    print("░████████   ░█████████     ░██    ░██    ░██ ░█████████ ░██    ░██ ░█████████  ░█████████  ", flush=True)
    print("░██     ░██ ░██    ░██     ░██     ░██  ░██  ░██    ░██ ░██    ░██ ░██         ░██   ░██   ", flush=True)
    print("░██     ░██ ░██    ░██     ░██      ░██░██   ░██    ░██ ░██   ░██  ░██         ░██    ░██  ", flush=True)
    print("░█████████  ░██    ░██     ░██       ░███    ░██    ░██ ░███████   ░██████████ ░██     ░██ ", flush=True)
    print("                                                                                           ", flush=True)
    print("===========================================================================================", flush=True)
    print(f"BATVADER API SERVER STARTAR", flush=True)
    print(f"Koddagens datum: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print("Version: 1.0.0 (CalVer)", flush=True)
    print("Byggd med: FastAPI & WebSockets för 100% Live UI", flush=True)
    print("===========================================================================================\n", flush=True)
    
    scheduler = AsyncIOScheduler()
    scheduler.add_job(update_weather_job, 'cron', minute=1)
    scheduler.start()
    
    # Kör alltid en datahämtning vid start
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Tvingar en initial datahämtning vid uppstart...", flush=True)
    await update_weather_job()
        
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

@app.websocket("/ws/weather")
async def websocket_endpoint(websocket: WebSocket, lat: float = DEFAULT_LAT, lon: float = DEFAULT_LON):
    await manager.connect(websocket)
    db = SessionLocal()
    try:
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
            data = fetch_weather_data(lat, lon)
            if data:
                weather_record = models.WeatherData(
                    latitude=lat,
                    longitude=lon,
                    data=json.dumps(data)
                )
                db.add(weather_record)
                db.commit()
                target_lat = lat
                target_lon = lon

        latest = db.query(models.WeatherData)\
            .filter(models.WeatherData.latitude == target_lat, models.WeatherData.longitude == target_lon)\
            .order_by(models.WeatherData.timestamp.desc())\
            .first()

        if latest:
            await websocket.send_text(latest.data)
            
        print(f"[{datetime.datetime.now()}] WebSocket connected, entering wait loop for {lat},{lon}")
        while True:
            # Håll connection öppen
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            
    except WebSocketDisconnect:
        print(f"[{datetime.datetime.now()}] Client disconnected from WebSocket.")
        manager.disconnect(websocket)
    except Exception as e:
        print(f"[{datetime.datetime.now()}] CRITICAL WEBSOCKET ERROR: {e}")
        manager.disconnect(websocket)
    finally:
        db.close()

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
        data = fetch_weather_data(lat, lon)
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

class TripPlanRequest(BaseModel):
    lat: float
    lon: float
    start_time: str
    end_time: str

@app.post("/api/plan-trip")
def plan_trip(req: TripPlanRequest, db: Session = Depends(get_db)):
    latest = db.query(models.WeatherData)\
        .filter(models.WeatherData.latitude == req.lat, models.WeatherData.longitude == req.lon)\
        .order_by(models.WeatherData.timestamp.desc())\
        .first()
    
    if not latest:
        return {"error": "Ingen väderdata hittades för denna plats."}
        
    data = json.loads(latest.data)
    
    trip_data = []
    in_trip = False
    for hour in data.get('timeSeries', []):
        t = hour.get('time')
        if t == req.start_time:
            in_trip = True
            
        if in_trip:
            trip_data.append(hour)
            
        if t == req.end_time:
            break
            
    if not trip_data:
         return {"error": "Kunde inte hitta väderdata för angiven tidsperiod."}
         
    weather_summary = ""
    for hour in trip_data:
        t = hour['time']
        params = {p['name']: p['values'][0] for p in hour.get('parameters', [])}
        temp = params.get('t', 'N/A')
        wind = params.get('ws', 'N/A')
        gust = params.get('gust', 'N/A')
        wave = hour.get('data', {}).get('ocean_wave_height', 'N/A')
        
        # Determine rain
        rain = params.get('pmean', 0)
        rain_str = f"{rain} mm" if rain > 0 else "Uppehåll"
        
        weather_summary += f"Tid: {t}, Temp: {temp}C, Vind: {wind} m/s (byar {gust} m/s), Nederbörd: {rain_str}, Vågor: {wave} m\n"
        
    system_prompt = "Du är en maritim AI-assistent och expert på båtväder. Du svarar på svenska. Din uppgift är att ge en koncis men detaljerad bedömning för en planerad båtresa baserat på väderdatan."
    
    user_prompt = f"Jag planerar en båtresa för nedanstående tidpunkt. Ge mig en prognos för resan, uppmärksamma mig på om det blåser upp, om det blir regn eller höga vågor. Bedöm generellt om resan ser säker ut eller om det kräver försiktighet.\n\nVäderdata:\n{weather_summary}"
    
    lmstudio_url = os.environ.get("LMSTUDIO_URL", "http://192.168.1.239:11434/api/v0")
    lmstudio_model = os.environ.get("LMSTUDIO_MODEL", "qwen/qwen3.5-9b")
    
    try:
        payload = {
            "model": lmstudio_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.3
        }
        res = requests.post(f"{lmstudio_url}/chat/completions", json=payload, timeout=40)
        res.raise_for_status()
        ai_response = res.json()
        text = ai_response["choices"][0]["message"]["content"]
        return {"result": text}
    except Exception as e:
        print(f"[{datetime.datetime.now()}] Error calling AI: {e}", flush=True)
        return {"error": f"Kunde inte generera AI-prognos: Misslyckades att kontakta AI-motorn."}

