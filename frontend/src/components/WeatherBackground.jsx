import React from 'react';

const WeatherBackground = ({ data }) => {
  const getParam = (name) => {
    try {
      const val = data.timeSeries[0].data[name];
      return val !== undefined ? val : 0;
    } catch {
      return 0;
    }
  };

  const symbolCode = parseInt(getParam('symbol_code'), 10) || 0;
  const windSpeed = parseFloat(getParam('wind_speed')) || 0;

  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 5;
  const isSunrise = hour >= 5 && hour < 9;
  const isSunset = hour >= 18 && hour < 22;

  // Determine sky gradient based on BOTH time AND weather
  let skyGradient;
  
  const isClear = symbolCode >= 1 && symbolCode <= 3;
  const isCloudy = symbolCode >= 4 && symbolCode <= 7;
  const isRain = (symbolCode >= 8 && symbolCode <= 10) || (symbolCode >= 18 && symbolCode <= 20);
  const isThunder = symbolCode === 11 || symbolCode === 21;
  const isSnow = (symbolCode >= 12 && symbolCode <= 17) || (symbolCode >= 22 && symbolCode <= 27);

  if (isThunder) {
    skyGradient = 'linear-gradient(to bottom, #0a0a1a, #1a1a2e, #16213e)';
  } else if (isRain) {
    if (isNight) {
      skyGradient = 'linear-gradient(to bottom, #0a0a12, #1a1a28, #0d1117)';
    } else {
      skyGradient = 'linear-gradient(to bottom, #2c3e50, #4a6274, #6b8299)';
    }
  } else if (isSnow) {
    if (isNight) {
      skyGradient = 'linear-gradient(to bottom, #1a1a2e, #2d2d44, #3a3a55)';
    } else {
      skyGradient = 'linear-gradient(to bottom, #b0c4de, #d3dfe8, #e8eff5)';
    }
  } else if (isCloudy) {
    if (isNight) {
      skyGradient = 'linear-gradient(to bottom, #0d1117, #1a1f2e, #2d3748)';
    } else if (isSunrise) {
      skyGradient = 'linear-gradient(to bottom, #4a4a5e, #7a6b7a, #b8956b)';
    } else if (isSunset) {
      skyGradient = 'linear-gradient(to bottom, #3a3a4e, #6a5a6a, #8a6a4a)';
    } else {
      skyGradient = 'linear-gradient(to bottom, #607d8b, #78909c, #90a4ae)';
    }
  } else if (isClear) {
    if (isNight) {
      skyGradient = 'linear-gradient(to bottom, #020111, #0a0a2e, #20124d)';
    } else if (isSunrise) {
      skyGradient = 'linear-gradient(to bottom, #20124d, #ab578b, #ffb76b)';
    } else if (isSunset) {
      skyGradient = 'linear-gradient(to bottom, #20124d, #8a2387, #e94057, #ff7b00)';
    } else {
      skyGradient = 'linear-gradient(to bottom, #0047b3, #00a2ff, #87ceeb)';
    }
  } else {
    skyGradient = isNight 
      ? 'linear-gradient(to bottom, #020111, #20124d)'
      : 'linear-gradient(to bottom, #0047b3, #00a2ff)';
  }

  // Wave animation speed based on wind
  const waveDuration1 = Math.max(2, 20 - windSpeed);
  const waveDuration2 = Math.max(3, 23 - windSpeed);
  const waveDuration3 = Math.max(4, 25 - windSpeed);

  // Rain drops
  const renderRainDrops = () => {
    if (!isRain && !isThunder) return null;
    const drops = [];
    const count = isThunder ? 40 : symbolCode === 10 || symbolCode === 20 ? 30 : 15;
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 0.4 + Math.random() * 0.3;
      const opacity = 0.2 + Math.random() * 0.4;
      drops.push(
        <div key={`rain-${i}`} style={{
          position: 'absolute',
          left: `${left}%`,
          top: '-10px',
          width: '2px',
          height: `${10 + Math.random() * 15}px`,
          background: `rgba(174, 194, 224, ${opacity})`,
          animation: `rain-fall ${duration}s linear ${delay}s infinite`,
        }} />
      );
    }
    return drops;
  };

  // Snow flakes
  const renderSnowFlakes = () => {
    if (!isSnow) return null;
    const flakes = [];
    for (let i = 0; i < 25; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      const size = 3 + Math.random() * 5;
      flakes.push(
        <div key={`snow-${i}`} style={{
          position: 'absolute',
          left: `${left}%`,
          top: '-10px',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.7)',
          animation: `snow-fall ${duration}s linear ${delay}s infinite`,
        }} />
      );
    }
    return flakes;
  };

  // Thunder flash
  const renderThunderFlash = () => {
    if (!isThunder) return null;
    return (
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'white',
        animation: 'thunder-flash 6s infinite',
        pointerEvents: 'none',
      }} />
    );
  };

  return (
    <div className="weather-bg-container" style={{ background: skyGradient }}>
      {isCloudy && !isNight && (
        <div className="weather-bg-overlay" style={{ opacity: 0.3 }} />
      )}

      {renderRainDrops()}
      {renderSnowFlakes()}
      {renderThunderFlash()}

      {/* SVG Waves */}
      <div className="ocean">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.15)" style={{ animationDuration: `${waveDuration1}s` }} />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.25)" style={{ animationDuration: `${waveDuration2}s` }} />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.1)" style={{ animationDuration: `${waveDuration3}s` }} />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#0b2447" style={{ animationDuration: `${waveDuration1 + 2}s` }} />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default WeatherBackground;
