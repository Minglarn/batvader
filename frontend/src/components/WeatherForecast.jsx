import React, { useState } from 'react';
import WeatherIcon from './WeatherIcon';
import WeatherNow from './WeatherNow';

function WeatherForecast({ data, location, dataSource }) {
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
      const d = hourData.data;
      const vSMHI = d[name];
      const vMETEO = d['meteo_' + name];
      
      if (dataSource === 'smhi') return vSMHI !== undefined && vSMHI !== null ? vSMHI : 'N/A';
      if (dataSource === 'meteo') return vMETEO !== undefined && vMETEO !== null ? vMETEO : (vSMHI !== undefined && vSMHI !== null ? vSMHI : 'N/A');
      if (dataSource === 'average') {
        const sValid = vSMHI !== undefined && vSMHI !== null && !isNaN(vSMHI);
        const mValid = vMETEO !== undefined && vMETEO !== null && !isNaN(vMETEO);
        if (sValid && mValid) {
          if (name === 'symbol_code') return Math.max(vSMHI, vMETEO);
          const avg = (parseFloat(vSMHI) + parseFloat(vMETEO)) / 2;
          return Math.round(avg * 10) / 10;
        }
        if (sValid) return vSMHI;
        if (mValid) return vMETEO;
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const isValid = (v) => v !== 'N/A' && v !== '-' && v !== undefined && v !== null;

  // Samma färgskala som i NU-fliken
  const getTempColor = (val) => {
    if (!isValid(val)) return '#ffffff';
    const t = parseFloat(val);
    if (isNaN(t)) return '#ffffff';
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
        <div className="modal-overlay" onClick={() => setSelectedHour(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedHour(null)}>×</button>
            <h2 style={{marginTop: 0, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center'}}>
              {new Date(selectedHour.time).toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}
            </h2>
            <WeatherNow data={{ timeSeries: [selectedHour], referenceTime: data.referenceTime, water_level: data.water_level }} location={location} dataSource={dataSource} />
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherForecast;
