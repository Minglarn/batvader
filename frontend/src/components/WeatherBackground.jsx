import React, { useMemo } from 'react';

const WeatherBackground = ({ data }) => {
  const getParam = (name) => {
    try {
      const val = data.timeSeries[0].data[name];
      return val !== undefined ? val : 0;
    } catch {
      return 0;
    }
  };

  const symbolCode = getParam('symbol_code');
  const windSpeed = getParam('wind_speed');

  const hour = new Date().getHours();

  // Determine Sky Gradient based on time of day
  let skyGradient = 'linear-gradient(to bottom, #0047b3, #00a2ff)'; // Default Day
  
  if (hour >= 22 || hour < 5) {
    // Night
    skyGradient = 'linear-gradient(to bottom, #020111, #20124d)';
  } else if (hour >= 5 && hour < 9) {
    // Sunrise
    skyGradient = 'linear-gradient(to bottom, #20124d, #ab578b, #ffb76b)';
  } else if (hour >= 18 && hour < 22) {
    // Sunset
    skyGradient = 'linear-gradient(to bottom, #20124d, #8a2387, #e94057, #ff7b00)';
  }

  // Check if it's cloudy or raining (desaturate/darken sky)
  // 4-7: Clouds, 8-10, 18-20: Rain, 11,21: Thunder, 12-17,22-27: Snow
  const isCloudyOrWorse = symbolCode >= 4;
  
  // Calculate wave animation speed based on wind
  // wind 0 => 20s, wind 10 => 5s, wind 20 => 2s
  const speed = windSpeed === '-' ? 0 : parseFloat(windSpeed);
  const waveDuration1 = Math.max(2, 20 - speed);
  const waveDuration2 = Math.max(3, 23 - speed);
  const waveDuration3 = Math.max(4, 25 - speed);

  return (
    <div className="weather-bg-container" style={{ background: skyGradient }}>
      {/* Overlay to dim sky if cloudy/raining */}
      {isCloudyOrWorse && (
        <div className="weather-bg-overlay" />
      )}

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
