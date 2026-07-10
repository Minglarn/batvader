import React from 'react';

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

export default WeatherNow;
