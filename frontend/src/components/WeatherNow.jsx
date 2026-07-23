import React, { useState, useEffect } from 'react';
import WeatherIcon from './WeatherIcon';
import imgLungt from '../assets/lungt.jpg';
import imgSvagVind from '../assets/svag_vind.jpg';
import imgMattligVind from '../assets/mattlig_vind.jpg';
import imgFriskVind from '../assets/frisk_vind.jpg';
import imgHardVind from '../assets/hard_vind.jpg';
import imgStormVind from '../assets/storm_vind.jpg';
import imgOrkanVind from '../assets/orkan_vind.jpg';

function WeatherNow({ data, location, dataSource }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState('');

  const changeIndex = (newIndex) => {
    if (newIndex > currentIndex) setSlideDirection('slide-next');
    else if (newIndex < currentIndex) setSlideDirection('slide-prev');
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    setCurrentIndex(0);
  }, [data?.referenceTime]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < data.timeSeries.length - 1) {
      changeIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      changeIndex(currentIndex - 1);
    }
  };

  if (!data || data.error) return <h1>INGEN DATA TILLGÄNGLIG</h1>;
  
  const currentData = data.timeSeries[currentIndex] || data.timeSeries[0];

  const getParam = (name) => {
    try {
      const d = currentData.data;
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
  const seaWaterTemp = getParam('sea_water_temperature');
  const waterLevel = data.water_level?.value;
  const waterStation = data.water_level?.station;
  // Temperaturfärg: blå (kallt) -> grön (svalt) -> gul -> orange -> röd (hett)
  const getTempColor = (val) => {
    if (!isValid(val)) return '#ffffff';
    const t = parseFloat(val);
    if (isNaN(t)) return '#ffffff';
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
    if (w < 3.4) return 'Svag vind';
    if (w < 8.0) return 'Måttlig vind';
    if (w < 13.9) return 'Frisk vind';
    if (w < 17.2) return 'Styv kuling';
    if (w < 20.8) return 'Hård kuling';
    if (w < 24.5) return 'Halv storm';
    if (w < 32.7) return 'Storm';
    return 'Orkan';
  };
  
  const getGustScale = (ms) => {
    if (!isValid(ms)) return 'N/A';
    const w = parseFloat(ms);
    if (w >= 32.7) return 'Orkanbyar';
    if (w >= 24.5) return 'Stormbyar';
    if (w >= 21.0) return 'Mycket hårda vindbyar';
    if (w >= 14.0) return 'Hårda vindbyar';
    return getBeaufortScale(w);
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

  const getSeaStateImage = (wave, windSpeed) => {
    const wh = parseFloat(wave);
    const w = parseFloat(windSpeed);
    
    if (!isNaN(wh)) {
      if (wh < 0.3) return imgLungt;
      if (wh < 0.5) return imgSvagVind;
      if (wh < 1.25) return imgMattligVind;
      if (wh < 2.5) return imgFriskVind;
      if (wh < 4.0) return imgHardVind;
      if (wh < 9.0) return imgStormVind;
      return imgOrkanVind;
    }

    if (isNaN(w) || w < 0.3) { 
      return imgLungt;
    } else if (w < 3.4) { 
      return imgSvagVind;
    } else if (w < 8.0) { 
      return imgMattligVind;
    } else if (w < 13.9) { 
      return imgFriskVind;
    } else if (w < 24.5) {
      return imgHardVind;
    } else if (w < 32.7) {
      return imgStormVind;
    } else {
      return imgOrkanVind;
    }
  };

  const isRain = (code) => {
    const c = parseInt(code, 10);
    return [8,9,10,11,12,13,14,18,19,20,22,23,24].includes(c);
  };
  const isSnow = (code) => {
    const c = parseInt(code, 10);
    return [15,16,17,25,26,27].includes(c);
  };
  
  const getPrecipText = (p, sym) => {
    if (!isValid(p)) return 'N/A';
    if (parseFloat(p) > 0) {
      if (isSnow(sym)) return 'Snöfall';
      return 'Regn';
    }
    if (isSnow(sym)) return 'Lätt snöfall';
    if (isRain(sym)) return 'Lätt regn';
    return 'Uppehåll';
  };

  const currentTimeObj = new Date(currentData.time);
  const timeString = currentTimeObj.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTimeObj.toLocaleDateString('sv-SE', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div 
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
      style={{ userSelect: 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 5px' }}>
        <button 
          onClick={() => changeIndex(currentIndex - 1)} 
          disabled={currentIndex === 0}
          style={{ background: 'none', border: 'none', color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : 'var(--accent)', fontSize: '1.5rem', cursor: 'pointer', padding: '10px' }}
        >
          &larr;
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '1.5rem', letterSpacing: '2px' }}>
            {timeString}
          </h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            {dateString}
          </div>
        </div>
        <button 
          onClick={() => changeIndex(currentIndex + 1)} 
          disabled={currentIndex >= data.timeSeries.length - 1}
          style={{ background: 'none', border: 'none', color: currentIndex >= data.timeSeries.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--accent)', fontSize: '1.5rem', cursor: 'pointer', padding: '10px' }}
        >
          &rarr;
        </button>
      </div>

      <div key={currentIndex} className={slideDirection} style={{ animationDuration: '0.3s' }}>
        <div className="weather-header" style={{ position: 'relative', overflow: 'hidden', padding: '20px', borderRadius: '8px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)', marginBottom: '20px' }}>
        {(isValid(waveHeight) || isValid(wind)) && (
          <img 
            src={getSeaStateImage(waveHeight, wind)} 
            alt="Havsutsikt bakgrund"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
              opacity: 0.5
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="temp-large" style={{ display: 'flex', alignItems: 'baseline', gap: '15px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            <div style={{ color: getTempColor(temp) }}>
              {isValid(temp) ? `${temp}` : 'N/A'}
              {isValid(temp) && <span style={{ fontSize: '2rem' }}>°C</span>}
            </div>
          </div>
          <div className="weather-icon-container" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.6))' }}>
            <WeatherIcon symbolCode={symbolCode} windSpeed={wind} windDir={windDirDeg} time={currentData.time} lat={location?.lat} lon={location?.lon} />
          </div>
        </div>
      </div>
      <div className="info-grid">
        <div className="info-card">
          <div className="info-card-title">Vindhastighet</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>
            {isValid(wind) ? wind : 'N/A'}{isValid(wind) && <span style={{fontSize: '1rem'}}>m/s</span>}
          </div>
          <div className="info-card-subtext">{getBeaufortScale(wind)}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Byvind</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>{isValid(gust) ? gust : 'N/A'}{isValid(gust) && <span style={{fontSize: '1rem'}}>m/s</span>}</div>
          <div className="info-card-subtext">{getGustScale(gust)}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Nederbörd</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>
            {isValid(precip) ? (parseFloat(precip) === 0 && isRain(symbolCode) ? '< 0.2' : precip) : 'N/A'}
            {isValid(precip) && <span style={{fontSize: '1rem'}}>mm</span>}
          </div>
          <div className="info-card-subtext">{getPrecipText(precip, symbolCode)}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Vågor</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>
            {isValid(waveHeight) ? waveHeight : 'N/A'}{isValid(waveHeight) && <span style={{fontSize: '1rem'}}>m</span>}
          </div>
          <div className="info-card-subtext">{isValid(waveHeight) ? (parseFloat(waveHeight) < 0.5 ? 'Lugnt vatten' : parseFloat(waveHeight) < 1.5 ? 'Lätt sjögång' : 'Hög sjögång') : 'N/A'}</div>
        </div>
        
        <div className="info-card">
          <div className="info-card-title">Lufttryck</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>
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
          <div className="info-card-title">Vattenstånd</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: waterLevel !== undefined && waterLevel !== null ? (waterLevel > 0 ? '#48cae4' : waterLevel < 0 ? '#ef233c' : '#ffffff') : '#ffffff'}}>
            {waterLevel !== undefined && waterLevel !== null ? (waterLevel > 0 ? `+${waterLevel}` : waterLevel) : 'N/A'}
            {waterLevel !== undefined && waterLevel !== null && <span style={{fontSize: '1rem'}}> cm</span>}
          </div>
          <div className="info-card-subtext" style={{ fontSize: '0.7rem' }}>
            {waterStation ? `Station: ${waterStation}` : 'N/A'}
          </div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Risk för åska</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>
             {isValid(thunder) ? thunder : 'N/A'}{isValid(thunder) && <span style={{fontSize: '1rem'}}> %</span>}
          </div>
          <div className="info-card-subtext">{isValid(thunder) ? (parseFloat(thunder) > 50 ? 'Hög risk' : parseFloat(thunder) > 10 ? 'Viss risk' : 'Låg risk') : 'N/A'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Sikt</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>{isValid(visibility) ? visibility : 'N/A'}{isValid(visibility) && <span style={{fontSize: '1rem'}}>km</span>}</div>
          <div className="info-card-subtext">{isValid(visibility) ? (visibility > 10 ? 'Mycket god sikt' : 'Dålig sikt') : 'N/A'}</div>
        </div>

        <div className="info-card">
          <div className="info-card-title">Vågriktning</div>
          <div className="info-card-value" style={{marginTop: 'auto', color: '#ffffff'}}>
            {isValid(waveDirection) ? <span style={{display: 'inline-block', transform: `rotate(${waveDirection}deg)`, fontSize: '2rem'}}>↓</span> : 'N/A'}
          </div>
          <div className="info-card-subtext">{isValid(waveDirection) ? `${Math.round(waveDirection)}°` : 'N/A'}</div>
        </div>

      </div>



      </div>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        Uppdaterat: {data.referenceTime ? new Date(data.referenceTime).toLocaleString('sv-SE') : 'Okänt'}
      </div>
    </div>
  );
}

export default WeatherNow;
