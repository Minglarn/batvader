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
          // location is already Trosa, so second useEffect will handle it
        },
        { timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    // Only connect when location is set, avoiding double calls on mount
    connectWebSocket(location.lat, location.lon, true);
    
    return () => {
      if (ws.current) {
        // Ta bort onclose tillfälligt för att undvika reconnect-loop när vi stänger medvetet
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [location.lat, location.lon]);

  const connectWebSocket = (lat, lon, isInitial = false) => {
    if (ws.current) {
      ws.current.onclose = null;
      ws.current.close();
    }
    
    if (isInitial && !weatherData) {
      setLoading(true);
    }
    
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
    };

    ws.current.onclose = () => {
      console.warn("WebSocket stängd, försöker återansluta om 5 sek...");
      setTimeout(() => {
        connectWebSocket(lat, lon, false);
      }, 5000);
    };
  };

  // Heartbeat för att hålla Nginx-proxy anslutningen öppen
  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send("ping");
      }
    }, 30000);
    return () => clearInterval(pingInterval);
  }, []);

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
        <div className="top-bar">
          <h2>{activeTab}</h2>
        </div>
        
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

export default App;
