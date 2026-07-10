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
          console.warn("Platstjänster fel:", error.message);
          setLocation({ lat: DEFAULT_LAT, lon: DEFAULT_LON });
        },
        { timeout: 10000, maximumAge: 0 }
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
