import React from 'react';
import WeatherIcon from './WeatherIcon';

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
  const symbolCode = getParam('symbol_code');
  
  // Ocean data
  const waveHeight = getParam('ocean_wave_height');
  const oceanVelocity = getParam('ocean_velocity');
  const oceanDirection = getParam('ocean_direction');

  const getWindDirection = (deg) => {
    if (deg === '-') return '-';
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = ["Nord", "Nordost", "Nordost", "Ostan", "Ost", "Sydost", "Sydost", "Syd", "Syd", "Sydväst", "Sydväst", "Västan", "Väst", "Nordväst", "Nordväst", "Nord"];
    return arr[(val % 16)];
  };
  
  const getBeaufortScale = (ms) => {
    if (ms === '-') return '-';
    const w = parseFloat(ms);
    if (w < 0.3) return 'Lugnt';
    if (w < 1.6) return 'Svag vind';
    if (w < 3.4) return 'Lätt bris';
    if (w < 5.5) return 'God bris';
    if (w < 8.0) return 'Frisk bris';
    if (w < 10.8) return 'Styv bris';
    if (w < 13.9) return 'Hård bris';
    if (w < 17.2) return 'Styv kuling';
    if (w < 20.8) return 'Hård kuling';
    if (w < 24.5) return 'Halv storm';
    if (w < 28.5) return 'Storm';
    return 'Orkan';
  };
  
  const getWeatherDescription = (codeStr) => {
    const c = parseInt(codeStr, 10);
    const descriptions = {
      1: 'Klart', 2: 'Lätt molnighet', 3: 'Halvklart', 4: 'Molnigt', 5: 'Mycket moln',
      6: 'Mulet', 7: 'Dimma', 8: 'Lätt regnskur', 9: 'Regnskur', 10: 'Kraftig regnskur',
      11: 'Åskskur', 12: 'Lätt by av regn/snö', 13: 'By av regn/snö', 14: 'Kraftig by av regn/snö',
      15: 'Lätt snöby', 16: 'Snöby', 17: 'Kraftig snöby', 18: 'Lätt regn', 19: 'Regn',
      20: 'Kraftigt regn', 21: 'Åska', 22: 'Lätt snöblandat regn', 23: 'Snöblandat regn',
      24: 'Kraftigt snöblandat regn', 25: 'Lätt snöfall', 26: 'Snöfall', 27: 'Kraftigt snöfall'
    };
    return descriptions[c] || 'Okänt väder';
  };

  return (
    <div>
      <div className="weather-header">
        <div className="temp-large">{temp}°C</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className="weather-icon-container">
            <WeatherIcon symbolCode={symbolCode} windSpeed={wind} windDir={windDirDeg} />
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'right', marginTop: '5px', lineHeight: '1.4' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{getWeatherDescription(symbolCode)}</span><br/>
            {getBeaufortScale(wind)} {wind !== '-' ? `${wind} m/s` : ''}
          </div>
        </div>
      </div>
      <div className="info-grid">
        <div className="info-card">
          <div className="info-card-title">Vindhastighet<br/>och riktning</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            {wind}<span style={{fontSize: '1rem'}}>m/s</span> 
            <span style={{display: 'inline-block', transform: `rotate(${windDirDeg !== '-' ? windDirDeg : 0}deg)`, marginLeft: '10px'}}>↓</span>
          </div>
          <div className="info-card-subtext">{getBeaufortScale(wind)}<br/>från {getWindDirection(windDirDeg)}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Byvind</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>{gust}<span style={{fontSize: '1rem'}}>m/s</span></div>
          <div className="info-card-subtext">{getBeaufortScale(gust)}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Nederbörd</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>{precip}<span style={{fontSize: '1rem'}}>mm</span></div>
          <div className="info-card-subtext">{precip > 0 ? 'Regn' : 'Uppehåll'}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Vågor</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
          </div>
          <div className="info-card-subtext">{waveHeight !== '-' ? `${waveHeight} m` : '-'}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Lufttryck</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 14l-4-4"></path>
              <path d="M3.34 16A10 10 0 1 1 20.66 16"></path>
            </svg>
          </div>
          <div className="info-card-subtext">{pressure} hPa</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Vattentemp</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>15°C</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Ström</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            <span style={{display: 'inline-block', transform: `rotate(${oceanDirection !== '-' ? oceanDirection : 0}deg)`}}>↓</span>
          </div>
          <div className="info-card-subtext">{oceanVelocity !== '-' ? `${oceanVelocity} km/h` : '-'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Risk för åska</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path><polyline points="13 14 11 18 14 18 12 22"></polyline></svg>
          </div>
          <div className="info-card-subtext">{thunder} %</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Sikt</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>{visibility}<span style={{fontSize: '1rem'}}>km</span></div>
          <div className="info-card-subtext">{visibility > 10 ? 'Mycket god sikt' : 'Dålig sikt'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Vattenstånd</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M12 2v10M8 6l4-4 4 4M2 18s2-2 4-2 4 2 4 2 4-2 4-2M2 22s2-2 4-2 4 2 4 2 4-2 4-2"></path></svg>
          </div>
          <div className="info-card-subtext">32.6 cm</div>
        </div>

      </div>
    </div>
  );
}

export default WeatherNow;
