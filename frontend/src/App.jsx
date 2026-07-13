import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import WeatherNow from './components/WeatherNow';
import TripPlanner from './components/TripPlanner';
import WeatherBackground from './components/WeatherBackground';
import Settings from './components/Settings';
import WeatherForecast from './components/WeatherForecast';
import Login from './components/Login';

const DEFAULT_LAT = 58.8986;
const DEFAULT_LON = 17.5504;

function App() {
  const [activeTab, setActiveTab] = useState('NU');
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [loading, setLoading] = useState(true);
  const [wsError, setWsError] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('batvader_theme') || 'oled';
  });
  const [dataSource, setDataSource] = useState(() => {
    return localStorage.getItem('batvader_datasource') || 'smhi';
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('batvader_token') || null;
  });

  useEffect(() => {
    localStorage.setItem('batvader_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('batvader_datasource', dataSource);
  }, [dataSource]);

  const ws = useRef(null);

  useEffect(() => {
    const fetchLocation = () => {
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
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      }
    };

    fetchLocation();
    const locInterval = setInterval(fetchLocation, 15 * 60 * 1000); // 15 minuter

    return () => clearInterval(locInterval);
  }, []);

  useEffect(() => {
    if (!token) return;
    // Only connect when location is set, avoiding double calls on mount
    connectWebSocket(location.lat, location.lon, true);
    
    return () => {
      if (ws.current) {
        // Ta bort onclose tillfälligt för att undvika reconnect-loop när vi stänger medvetet
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [location.lat, location.lon, token]);

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
    const wsUrl = `${protocol}//${host}/ws/weather?lat=${lat}&lon=${lon}&token=${token}`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.timeSeries) {
          setWeatherData(data);
          setLoading(false);
          setWsError(false);
          setPullDist(0);
        }
      } catch (err) {
        console.error("Kunde inte tolka websocket-data", err);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket fel:", error);
      setWsError(true);
    };

    ws.current.onclose = () => {
      console.warn("WebSocket stängd, försöker återansluta om 5 sek...");
      if (!weatherData) setWsError(true);
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

  const handleStart = (clientY) => {
    if (mainContentRef.current && mainContentRef.current.scrollTop <= 5) {
      setStartY(clientY);
    }
  };

  const handleMove = (clientY) => {
    if (startY !== null) {
      if (clientY > startY) {
        setPullDist(Math.min(clientY - startY, 100));
      }
    }
  };

  const handleEnd = () => {
    if (pullDist > 60) {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send("ping");
      } else {
        connectWebSocket(location.lat, location.lon);
      }
    }
    setStartY(null);
    setPullDist(0);
    setPullDist(0);
  };

  if (!token) {
    return <Login onLoginSuccess={setToken} />;
  }

  return (
    <div className={`app-container theme-${theme}`}>
      {theme === 'ocean' && <WeatherBackground data={weatherData} />}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div 
        className="main-content" 
        style={{ position: 'relative' }}
        onTouchStart={e => handleStart(e.touches[0].clientY)}
        onTouchMove={e => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onMouseDown={e => handleStart(e.clientY)}
        onMouseMove={e => handleMove(e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        ref={mainContentRef}
      >
        <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeTab} 
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
              - {weatherData?.location_name || 'Hämtar plats...'}
            </span>
          </h2>
          {activeTab === 'NU' && weatherData && (() => {
            const getP = (name) => { 
              try { 
                const d = weatherData.timeSeries[0].data;
                const vSMHI = d[name];
                const vMETEO = d['meteo_' + name];
                if (dataSource === 'smhi') return vSMHI !== undefined && vSMHI !== null ? vSMHI : '-';
                if (dataSource === 'meteo') return vMETEO !== undefined && vMETEO !== null ? vMETEO : (vSMHI !== undefined && vSMHI !== null ? vSMHI : '-');
                if (dataSource === 'average') {
                  const sValid = vSMHI !== undefined && vSMHI !== null && !isNaN(vSMHI);
                  const mValid = vMETEO !== undefined && vMETEO !== null && !isNaN(vMETEO);
                  if (sValid && mValid) {
                    // Symbol code should not be averaged, return SMHI
                    if (name === 'symbol_code') return vSMHI;
                    const avg = (parseFloat(vSMHI) + parseFloat(vMETEO)) / 2;
                    return Math.round(avg * 10) / 10;
                  }
                  if (sValid) return vSMHI;
                  if (mValid) return vMETEO;
                }
                return '-';
              } catch { return '-'; } 
            };
            const sc = parseInt(getP('symbol_code'), 10);
            const ws = getP('wind_speed');
            const descs = {1:'Klart',2:'Lätt molnighet',3:'Halvklart',4:'Molnigt',5:'Mycket moln',6:'Mulet',7:'Dimma',8:'Lätt regnskur',9:'Regnskur',10:'Kraftig regnskur',11:'Åskskur',12:'Lätt by av regn/snö',13:'By av regn/snö',14:'Kraftig by av regn/snö',15:'Lätt snöby',16:'Snöby',17:'Kraftig snöby',18:'Lätt regn',19:'Regn',20:'Kraftigt regn',21:'Åska',22:'Lätt snöblandat regn',23:'Snöblandat regn',24:'Kraftigt snöblandat regn',25:'Lätt snöfall',26:'Snöfall',27:'Kraftigt snöfall'};
            const w = parseFloat(ws);
            const bf = isNaN(w) ? '' : w<0.3?'Lugnt':w<1.6?'Svag vind':w<3.4?'Lätt bris':w<5.5?'God bris':w<8.0?'Frisk bris':w<10.8?'Styv bris':w<13.9?'Hård bris':w<17.2?'Styv kuling':w<20.8?'Hård kuling':w<24.5?'Halv storm':w<28.5?'Storm':'Orkan';
            return (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                {descs[sc] || ''} &middot; {bf} {ws !== '-' ? `${ws} m/s` : ''}
              </span>
            );
          })()}
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
          <div style={{textAlign: 'center', marginTop: '20vh'}}>
            <h1 style={{color: wsError ? '#ff4444' : 'var(--text-primary)'}}>
              {wsError ? 'ANSLUTNINGSFEL' : 'LADDAR DATA...'}
            </h1>
            {wsError && (
              <p style={{color: 'var(--text-secondary)', maxWidth: '300px', margin: '20px auto', lineHeight: '1.5'}}>
                Kunde inte ansluta till servern. Försöker igen...<br/><br/>
                Om detta fortsätter, kontrollera att mobilens IP till servern stämmer och att Windows-brandväggen tillåter port 8090.
              </p>
            )}
          </div>
        ) : (
          <>
            {activeTab === 'NU' && <WeatherNow data={weatherData} location={location} dataSource={dataSource} />}
            {activeTab === 'PROGNOS' && <WeatherForecast data={weatherData} location={location} dataSource={dataSource} />}
            {activeTab === 'PLANERA' && <TripPlanner data={weatherData} location={location} dataSource={dataSource} />}
            {activeTab === 'INSTÄLLNINGAR' && <Settings theme={theme} setTheme={setTheme} dataSource={dataSource} setDataSource={setDataSource} />}
            <footer style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center', fontSize: '0.8rem' }}>
              Väderdata: {dataSource === 'smhi' ? 'SMHI' : dataSource === 'meteo' ? 'MET Norway' : 'SMHI & MET Norway'} | Havsdata: MET Norway
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
