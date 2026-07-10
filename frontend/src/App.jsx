import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { getWeatherData } from './services/api';

const DEFAULT_LAT = 58.8986;
const DEFAULT_LON = 17.5504;

function App() {
  const [activeTab, setActiveTab] = useState('NU');
  const [weatherData, setWeatherData] = useState(null);
  const [location, setLocation] = useState({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
  const [loading, setLoading] = useState(true);

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
          console.error("Platstjänster fel:", error);
          setLocation({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
        }
      );
    } else {
      setLocation({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
    }
  }, []);

  useEffect(() => {
    let interval;
    const fetchWeather = async () => {
      setLoading(true);
      const data = await getWeatherData(location.lat, location.lon);
      setWeatherData(data);
      setLoading(false);
    };

    fetchWeather();
    // Frontend hämtar från databasen var 5:e minut
    interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location]);

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        {loading && !weatherData ? (
          <h1>LADDAR DATA...</h1>
        ) : (
          <>
            {activeTab === 'NU' && <WeatherNow data={weatherData} />}
            {activeTab === 'DETALJERAT' && <h1>DETALJERAT (Kommer Snart)</h1>}
            {activeTab === 'PROGNOS' && <h1>PROGNOS (Kommer Snart)</h1>}
            {activeTab === 'INSTÄLLNINGAR' && <h1>INSTÄLLNINGAR (Kommer Snart)</h1>}
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
      const param = data.timeSeries[0].parameters.find(p => p.name === name);
      return param ? param.values[0] : '-';
    } catch {
      return '-';
    }
  };

  const temp = getParam('t');
  const wind = getParam('ws');
  const gust = getParam('gust');
  
  return (
    <div>
      <h1>JUST NU</h1>
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
      </div>
    </div>
  );
}

export default App;
