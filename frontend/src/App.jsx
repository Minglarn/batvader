import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import WeatherNow from './components/WeatherNow';
import WeatherDetailed from './components/WeatherDetailed';

const DEFAULT_LAT = 58.8986;
const DEFAULT_LON = 17.5504;

function App() {
  const [activeTab, setActiveTab] = useState('NU');
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [loading, setLoading] = useState(true);

  const ws = useRef(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn(`Platstjänster fel: ${error.message}. Använder standard (Trosa).`);
          connectWebSocket(DEFAULT_LAT, DEFAULT_LON);
        },
        { timeout: 10000 }
      );
    } else {
      connectWebSocket(DEFAULT_LAT, DEFAULT_LON);
    }
  }, []);

  useEffect(() => {
    if (location.lat !== DEFAULT_LAT || location.lon !== DEFAULT_LON) {
      connectWebSocket(location.lat, location.lon);
    } else if (location.lat === DEFAULT_LAT && location.lon === DEFAULT_LON && loading) {
       connectWebSocket(DEFAULT_LAT, DEFAULT_LON);
    }
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [location.lat, location.lon]);

  const connectWebSocket = (lat, lon) => {
    if (ws.current) ws.current.close();
    setLoading(true);
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/weather?lat=${lat}&lon=${lon}`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.timeSeries) {
          setWeatherData(data);
          setLoading(false);
          setPullDist(0);
        }
      } catch (err) {
        console.error("Kunde inte tolka websocket-data", err);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket fel:", error);
      setLoading(false);
    };

    ws.current.onclose = () => {
      console.warn("WebSocket stängd, försöker återansluta om 5 sek...");
      setTimeout(() => {
        connectWebSocket(lat, lon);
      }, 5000);
    };
  };

  const [startY, setStartY] = useState(null);
  const [pullDist, setPullDist] = useState(0);
  const mainContentRef = useRef(null);

  const handleTouchStart = (e) => {
    if (mainContentRef.current && mainContentRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY !== null) {
      const y = e.touches[0].clientY;
      if (y > startY) {
        setPullDist(Math.min(y - startY, 100));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDist > 60) {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send("ping");
      } else {
        connectWebSocket(location.lat, location.lon);
      }
    }
    setStartY(null);
    setPullDist(0);
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div 
        className="main-content" 
        style={{ position: 'relative' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={mainContentRef}
      >
        {(pullDist > 0 || (loading && weatherData)) && (
          <div style={{ 
            height: loading ? '60px' : `${pullDist}px`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            color: pullDist > 60 || loading ? 'var(--accent)' : 'var(--text-secondary)',
            transition: loading ? 'height 0.3s ease' : 'none'
          }}>
            <svg 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{
                transform: loading ? 'none' : `rotate(${pullDist * 3}deg)`,
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
          </div>
        )}
        {loading && !weatherData ? (
          <h1 style={{textAlign: 'center', marginTop: '20vh'}}>LADDAR DATA...</h1>
        ) : (
          <>
            {activeTab === 'NU' && <WeatherNow data={weatherData} />}
            {activeTab === 'DETALJERAT' && <WeatherDetailed data={weatherData} />}
            {activeTab === 'PROGNOS' && <div>PROGNOS-VY KOMMER SNART</div>}
            {activeTab === 'INSTÄLLNINGAR' && <div>INSTÄLLNINGAR KOMMER SNART</div>}
            <footer style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center', fontSize: '0.8rem' }}>
              Väderdata levererad av SMHI
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function WeatherNow({ data }) {
  if (!data || data.error) return <h1>INGEN DATA TILLGÄNGLIG</h1>;
  
  const getParam = (name) => {
    try {
      const val = data.timeSeries[0].data[name];
      return val !== undefined ? val : '-';
    } catch {
      return '-';
    }
  };

  const temp = getParam('air_temperature');
  const wind = getParam('wind_speed');
  const gust = getParam('wind_speed_of_gust');
  const windDirDeg = getParam('wind_from_direction');
  const pressure = getParam('air_pressure_at_mean_sea_level');
  const visibility = getParam('visibility_in_air');
  const precip = getParam('precipitation_amount_mean');
  const humidity = getParam('relative_humidity');
  const thunder = getParam('thunderstorm_probability');

  const getWindDirection = (deg) => {
    if (deg === '-') return '-';
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = ["N", "NNO", "NO", "ONO", "O", "OSO", "SO", "SSO", "S", "SSV", "SV", "VSV", "V", "VNV", "NV", "NNV"];
    return arr[(val % 16)];
  };
  
  return (
    <div>
      <div className="temp-large">{temp}°C</div>
      <div className="info-grid">
        <div className="info-card">
          <div className="info-card-title">Vind (m/s)</div>
          <div className="info-card-value">{wind}</div>
        </div>
        <div className="info-card">
          <div className="info-card-title">Byvind (m/s)</div>
          <div className="info-card-value">{gust}</div>
        </div>
        <div className="info-card">
          <div className="info-card-title">Riktning</div>
          <div className="info-card-value">{getWindDirection(windDirDeg)}</div>
        </div>
        <div className="info-card">
          <div className="info-card-title">Lufttryck (hPa)</div>
          <div className="info-card-value">{pressure}</div>
        </div>
        <div className="info-card">
          <div className="info-card-title">Sikt (km)</div>
          <div className="info-card-value">{visibility}</div>
        </div>
        <div className="info-card">
          <div className="info-card-title">Nederbörd (mm)</div>
          <div className="info-card-value">{precip}</div>
        </div>
        <div className="info-card">
          <div className="info-card-title">Åskrisk (%)</div>
          <div className="info-card-value">{thunder}</div>
        </div>
        <div className="info-card">
          <div className="info-card-title">Luftfuktighet (%)</div>
          <div className="info-card-value">{humidity}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
