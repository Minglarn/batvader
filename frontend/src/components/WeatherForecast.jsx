import React, { useState } from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherNow from './WeatherNow';

function WeatherForecast({ data, location }) {
  const [selectedHour, setSelectedHour] = useState(null);
  const [page, setPage] = useState(0);

  if (!data || !data.timeSeries || data.timeSeries.length < 2) {
    return <h1>INGEN PROGNOS TILLGÄNGLIG</h1>;
  }
  
  // Plocka ut 10 timmar per sida
  const itemsPerPage = 10;
  const startIndex = page * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage, data.timeSeries.length);
  const forecastData = data.timeSeries.slice(startIndex, endIndex);

  const hasNext = endIndex < data.timeSeries.length;
  const hasPrev = page > 0;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
          Prognos
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))} 
            disabled={!hasPrev}
            className="nav-btn"
            style={{ width: 'auto', padding: '0 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            &larr; Tidigare
          </button>
          <button 
            onClick={() => setPage(p => p + 1)} 
            disabled={!hasNext}
            className="nav-btn"
            style={{ width: 'auto', padding: '0 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            Senare &rarr;
          </button>
        </div>
      </div>
      <div className="info-grid">
        {forecastData.map((hour, index) => {
          const time = new Date(hour.time);
          const timeStr = `${time.toLocaleDateString('sv-SE', { weekday: 'short' })} ${time.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}`;
          const temp = getParam(hour, 'air_temperature');
          const wind = getParam(hour, 'wind_speed');
          const gust = getParam(hour, 'wind_speed_of_gust');
          const windDirDeg = getParam(hour, 'wind_from_direction');
          const symbolCode = getParam(hour, 'symbol_code');
          const precip = getParam(hour, 'precipitation_amount_mean');

          return (
            <div 
              key={index} 
              className="info-card" 
              style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
              onClick={() => setSelectedHour(hour)}
            >
              <div className="info-card-title">{timeStr}</div>
              
              <div style={{ marginTop: '15px', marginBottom: '15px', width: '50px', height: '50px' }}>
                <WeatherIcon symbolCode={symbolCode} windSpeed={wind} windDir={windDirDeg} time={hour.time} lat={location?.lat} lon={location?.lon} />
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

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Uppdaterat: {data.referenceTime ? new Date(data.referenceTime).toLocaleString('sv-SE') : 'Okänt'}
      </div>

      {selectedHour && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', backdropFilter: 'blur(5px)'
        }} onClick={() => setSelectedHour(null)}>
          <div className="modal-content" style={{
            backgroundColor: 'var(--bg-surface)', 
            borderRadius: '15px', 
            padding: '20px', 
            width: '100%', 
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button style={{
              position: 'absolute', top: '15px', right: '15px', 
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              fontSize: '2rem', cursor: 'pointer', lineHeight: 1, zIndex: 10
            }} onClick={() => setSelectedHour(null)}>×</button>
            <h2 style={{marginTop: 0, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center'}}>
              {new Date(selectedHour.time).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}
            </h2>
            <WeatherNow data={{ timeSeries: [selectedHour], referenceTime: data.referenceTime }} location={location} />
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherForecast;
