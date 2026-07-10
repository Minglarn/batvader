import React from 'react';
import WeatherIcon from './WeatherIcon';

function WeatherForecast({ data }) {
  if (!data || !data.timeSeries || data.timeSeries.length < 2) {
    return <h1>INGEN PROGNOS TILLGÄNGLIG</h1>;
  }
  
  // Plocka ut kommande 12 timmarna
  const forecastData = data.timeSeries.slice(1, 13);

  const getParam = (hourData, name) => {
    try {
      const val = hourData.data[name];
      return val !== undefined && val !== null ? val : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const isValid = (v) => v !== 'N/A' && v !== '-' && v !== undefined && v !== null;

  // Samma färgskala som i NU-fliken
  const getTempColor = (val) => {
    if (!isValid(val)) return 'var(--text-primary)';
    const t = parseFloat(val);
    if (isNaN(t)) return 'var(--text-primary)';
    if (t <= -10) return '#8ecae6';
    if (t <= 0)   return '#48cae4';
    if (t <= 5)   return '#00b4d8';
    if (t <= 10)  return '#0096c7';
    if (t <= 15)  return '#2dc653';
    if (t <= 20)  return '#80b918';
    if (t <= 25)  return '#f7b801';
    if (t <= 30)  return '#f77f00';
    return '#ef233c';
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Kommande 12 timmarna
      </h2>
      <div className="info-grid">
        {forecastData.map((hour, index) => {
          const time = new Date(hour.validTime);
          const timeStr = time.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
          const temp = getParam(hour, 'air_temperature');
          const wind = getParam(hour, 'wind_speed');
          const gust = getParam(hour, 'wind_speed_of_gust');
          const windDirDeg = getParam(hour, 'wind_from_direction');
          const symbolCode = getParam(hour, 'symbol_code');
          const precip = getParam(hour, 'precipitation_amount_mean');

          return (
            <div key={index} className="info-card" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="info-card-title">{timeStr}</div>
              
              <div style={{ marginTop: '15px', marginBottom: '15px', width: '50px', height: '50px' }}>
                <WeatherIcon symbolCode={symbolCode} windSpeed={wind} windDir={windDirDeg} />
              </div>
              
              <div className="info-card-value" style={{ marginTop: 'auto', color: getTempColor(temp), fontSize: '2rem' }}>
                {isValid(temp) ? `${temp}` : 'N/A'}{isValid(temp) && <span style={{fontSize: '1rem'}}>°C</span>}
              </div>
              
              <div className="info-card-subtext" style={{ marginTop: '10px' }}>
                {isValid(wind) ? `${wind}` : '-'}{isValid(gust) ? ` (${gust}) m/s` : ' m/s'}
                <br />
                {isValid(precip) && parseFloat(precip) > 0 ? (
                  <span style={{ color: '#48cae4' }}>{precip} mm</span>
                ) : (
                  'Uppehåll'
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="info-card" style={{ marginTop: '30px', padding: '20px', textAlign: 'left', width: '100%', borderLeft: '4px solid var(--accent)' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--accent)', marginTop: 0, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          AI-Analys
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
          Den AI-drivna väderprognosen och trendanalysen integreras här inom kort. Här kommer du få en smart sammanfattning av de mest väsentliga väderförändringarna att tänka på.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Uppdaterat: {data.referenceTime ? new Date(data.referenceTime).toLocaleString('sv-SE') : 'Okänt'}
      </div>
    </div>
  );
}

export default WeatherForecast;
