import React from 'react';
import WeatherIcon from './WeatherIcon';

function WeatherNow({ data }) {
  if (!data || data.error) return <h1>INGEN DATA TILLGÄNGLIG</h1>;
  
  const getParam = (name) => {
    try {
      const val = data.timeSeries[0].data[name];
      return val !== undefined && val !== null ? val : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const isValid = (v) => v !== 'N/A' && v !== '-' && v !== undefined && v !== null;

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
  
  // Ocean data (MET Norway Oceanforecast 2.0)
  const waveHeight = getParam('ocean_wave_height');
  const waveDirection = getParam('ocean_wave_direction');
  const oceanVelocity = getParam('ocean_velocity');
  const oceanDirection = getParam('ocean_direction');
  const seaWaterTemp = getParam('sea_water_temperature');

  // Temperaturfärg: blå (kallt) -> grön (svalt) -> gul -> orange -> röd (hett)
  const getTempColor = (val) => {
    if (!isValid(val)) return 'var(--text-primary)';
    const t = parseFloat(val);
    if (isNaN(t)) return 'var(--text-primary)';
    if (t <= -10) return '#8ecae6';    // Isblå
    if (t <= 0)   return '#48cae4';    // Ljusblå
    if (t <= 5)   return '#00b4d8';    // Blå
    if (t <= 10)  return '#0096c7';    // Mörkblå
    if (t <= 15)  return '#2dc653';    // Grön
    if (t <= 20)  return '#80b918';    // Lime
    if (t <= 25)  return '#f7b801';    // Gul/Orange
    if (t <= 30)  return '#f77f00';    // Orange
    return '#ef233c';                   // Röd
  };

  const getWindDirection = (deg) => {
    if (!isValid(deg)) return 'N/A';
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = ["Nord", "Nordost", "Nordost", "Ostan", "Ost", "Sydost", "Sydost", "Syd", "Syd", "Sydväst", "Sydväst", "Västan", "Väst", "Nordväst", "Nordväst", "Nord"];
    return arr[(val % 16)];
  };
  
  const getBeaufortScale = (ms) => {
    if (!isValid(ms)) return 'N/A';
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
    return descriptions[c] || 'N/A';
  };

  return (
    <div>
      <div className="weather-header">
        <div className="temp-large" style={{ color: getTempColor(temp) }}>
          {isValid(temp) ? `${temp}` : 'N/A'}
          {isValid(temp) && <span style={{ fontSize: '2rem' }}>°C</span>}
        </div>
        <div className="weather-icon-container">
          <WeatherIcon symbolCode={symbolCode} windSpeed={wind} windDir={windDirDeg} />
        </div>
      </div>
      <div className="info-grid">
        <div className="info-card">
          <div className="info-card-title">Vindhastighet<br/>och riktning</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            {isValid(wind) ? wind : 'N/A'}{isValid(wind) && <span style={{fontSize: '1rem'}}>m/s</span>}
            {isValid(windDirDeg) && <span style={{display: 'inline-block', transform: `rotate(${windDirDeg}deg)`, marginLeft: '10px'}}>↓</span>}
          </div>
          <div className="info-card-subtext">{getBeaufortScale(wind)}{isValid(windDirDeg) && <><br/>från {getWindDirection(windDirDeg)}</>}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Byvind</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>{isValid(gust) ? gust : 'N/A'}{isValid(gust) && <span style={{fontSize: '1rem'}}>m/s</span>}</div>
          <div className="info-card-subtext">{getBeaufortScale(gust)}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Nederbörd</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>{isValid(precip) ? precip : 'N/A'}{isValid(precip) && <span style={{fontSize: '1rem'}}>mm</span>}</div>
          <div className="info-card-subtext">{isValid(precip) ? (precip > 0 ? 'Regn' : 'Uppehåll') : 'N/A'}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Vågor</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            {isValid(waveHeight) ? waveHeight : 'N/A'}{isValid(waveHeight) && <span style={{fontSize: '1rem'}}>m</span>}
          </div>
          <div className="info-card-subtext">{isValid(waveHeight) ? (parseFloat(waveHeight) < 0.5 ? 'Lugnt vatten' : parseFloat(waveHeight) < 1.5 ? 'Lätt sjögång' : 'Hög sjögång') : 'N/A'}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Lufttryck</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            {isValid(pressure) ? pressure : 'N/A'}
          </div>
          <div className="info-card-subtext">{isValid(pressure) ? 'hPa' : ''}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Vattentemp</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: getTempColor(seaWaterTemp)}}>
            {isValid(seaWaterTemp) ? `${seaWaterTemp}` : 'N/A'}{isValid(seaWaterTemp) && <span style={{fontSize: '1rem'}}>°C</span>}
          </div>
          <div className="info-card-subtext">{isValid(seaWaterTemp) ? (parseFloat(seaWaterTemp) >= 20 ? 'Badvänligt' : parseFloat(seaWaterTemp) >= 15 ? 'Svalt' : 'Kallt') : 'N/A'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Ström</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            {isValid(oceanDirection) ? <span style={{display: 'inline-block', transform: `rotate(${oceanDirection}deg)`}}>↓</span> : 'N/A'}
          </div>
          <div className="info-card-subtext">{isValid(oceanVelocity) ? `${oceanVelocity} m/s` : 'N/A'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Risk för åska</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
             {isValid(thunder) ? thunder : 'N/A'}{isValid(thunder) && <span style={{fontSize: '1rem'}}> %</span>}
          </div>
          <div className="info-card-subtext">{isValid(thunder) ? (parseFloat(thunder) > 50 ? 'Hög risk' : parseFloat(thunder) > 10 ? 'Viss risk' : 'Låg risk') : 'N/A'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Sikt</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>{isValid(visibility) ? visibility : 'N/A'}{isValid(visibility) && <span style={{fontSize: '1rem'}}>km</span>}</div>
          <div className="info-card-subtext">{isValid(visibility) ? (visibility > 10 ? 'Mycket god sikt' : 'Dålig sikt') : 'N/A'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Vågriktning</div>
          <div className="info-card-value" style={{marginTop: 'auto'}}>
            {isValid(waveDirection) ? <span style={{display: 'inline-block', transform: `rotate(${waveDirection}deg)`, fontSize: '2rem'}}>↓</span> : 'N/A'}
          </div>
          <div className="info-card-subtext">{isValid(waveDirection) ? `${Math.round(waveDirection)}°` : 'N/A'}</div>
        </div>

      </div>
    </div>
  );
}

export default WeatherNow;
