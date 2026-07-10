import React from 'react';

// SMHI Wsymb2 code mapping:
// 1-3: Clear / Sun
// 4-7: Cloudy / Half clear
// 8-10, 18-20: Rain
// 11, 21: Thunder
// 12-17, 22-27: Snow

const WeatherIcon = ({ symbolCode, windSpeed, windDir }) => {
  const code = parseInt(symbolCode, 10);
  
  if (isNaN(code)) {
    return null;
  }

  const renderWindArrows = () => {
    if (windSpeed === undefined || windSpeed === '-' || isNaN(windSpeed) || windSpeed <= 0) return null;
    
    // Wind direction is "from", meaning wind coming from 90 (East) blows to 270 (West).
    // An arrow pointing right (0 deg) in SVG should be rotated by windDir - 90.
    const dir = parseInt(windDir, 10);
    const rotation = !isNaN(dir) ? dir - 90 : 0; 
    
    let numArrows = 1;
    let color = "rgba(255, 255, 255, 0.4)";
    let animSpeed = "2.5s";

    if (windSpeed < 3.4) {
      // Svag vind
      numArrows = 1;
      color = "rgba(255, 255, 255, 0.4)";
      animSpeed = "2.5s";
    } else if (windSpeed >= 3.4 && windSpeed < 8.0) {
      // Måttlig vind
      numArrows = 2;
      color = "rgba(255, 255, 255, 0.8)";
      animSpeed = "1.5s";
    } else if (windSpeed >= 8.0 && windSpeed < 13.9) {
      // Frisk vind
      numArrows = 3;
      color = "#FFD700"; // Yellow
      animSpeed = "0.9s";
    } else if (windSpeed >= 13.9 && windSpeed < 20.8) {
      // Hård vind
      numArrows = 4;
      color = "#FF8C00"; // Orange
      animSpeed = "0.6s";
    } else if (windSpeed >= 20.8) {
      // Mycket hård vind / Storm
      numArrows = 5;
      color = "#FF0000"; // Red
      animSpeed = "0.4s";
    }

    if (numArrows < 1) return null;

    return (
      <g transform={`rotate(${rotation} 50 50)`}>
        <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <animateTransform attributeName="transform" type="translate" from="-40 0" to="40 0" dur={animSpeed} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.2;0.8;1" dur={animSpeed} repeatCount="indefinite" />
          {Array.from({ length: numArrows }).map((_, i) => {
            const yOffset = (i - (numArrows - 1) / 2) * 12;
            return (
              <g key={i} transform={`translate(0, ${yOffset})`}>
                <line x1="30" y1="50" x2="70" y2="50" />
                <polyline points="60,45 70,50 60,55" />
              </g>
            );
          })}
        </g>
      </g>
    );
  };

  // 1-3: Sun
  if (code >= 1 && code <= 3) {
    return (
      <svg className="weather-icon anim-spin-slow" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF700" stopOpacity="1" />
            <stop offset="70%" stopColor="#FFAA00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF5500" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill="url(#sunGlow)" />
        {/* Sun rays */}
        <g stroke="#FFAA00" strokeWidth="4" strokeLinecap="round">
          <line x1="50" y1="5" x2="50" y2="15" />
          <line x1="50" y1="85" x2="50" y2="95" />
          <line x1="5" y1="50" x2="15" y2="50" />
          <line x1="85" y1="50" x2="95" y2="50" />
          <line x1="18" y1="18" x2="25" y2="25" />
          <line x1="75" y1="75" x2="82" y2="82" />
          <line x1="18" y1="82" x2="25" y2="75" />
          <line x1="75" y1="25" x2="82" y2="18" />
        </g>
        {renderWindArrows()}
      </svg>
    );
  }

  // 4-7: Clouds
  if (code >= 4 && code <= 7) {
    return (
      <svg className="weather-icon" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id="cloudGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#AAAAAA" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <g className="anim-float">
          <path d="M 30 60 A 15 15 0 0 1 30 30 A 20 20 0 0 1 70 35 A 15 15 0 0 1 70 60 Z" fill="url(#cloudGlow)" />
        </g>
        {renderWindArrows()}
      </svg>
    );
  }

  // 8-10, 18-20: Rain
  if ((code >= 8 && code <= 10) || (code >= 18 && code <= 20)) {
    return (
      <svg className="weather-icon" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id="darkCloud" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#777777" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#444444" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <g className="anim-float">
          <path d="M 30 50 A 15 15 0 0 1 30 20 A 20 20 0 0 1 70 25 A 15 15 0 0 1 70 50 Z" fill="url(#darkCloud)" />
        </g>
        <g stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" className="anim-rain">
          <line x1="40" y1="55" x2="35" y2="70" />
          <line x1="55" y1="50" x2="50" y2="65" />
          <line x1="70" y1="55" x2="65" y2="70" />
        </g>
        {renderWindArrows()}
      </svg>
    );
  }

  // 11, 21: Thunder
  if (code === 11 || code === 21) {
    return (
      <svg className="weather-icon" viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id="thunderCloud" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#555555" stopOpacity="1" />
            <stop offset="100%" stopColor="#222222" stopOpacity="1" />
          </linearGradient>
        </defs>
        <g className="anim-float">
          <path d="M 30 50 A 15 15 0 0 1 30 20 A 20 20 0 0 1 70 25 A 15 15 0 0 1 70 50 Z" fill="url(#thunderCloud)" />
        </g>
        <g className="anim-flash" fill="#FFF700">
          <polygon points="55,45 45,65 52,65 42,90 60,60 52,60" />
        </g>
        {renderWindArrows()}
      </svg>
    );
  }

  // 12-17, 22-27: Snow
  if ((code >= 12 && code <= 17) || (code >= 22 && code <= 27)) {
    return (
      <svg className="weather-icon" viewBox="0 0 100 100" width="100%" height="100%">
         <defs>
          <linearGradient id="snowCloud" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#DDDDDD" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#999999" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <g className="anim-float">
          <path d="M 30 50 A 15 15 0 0 1 30 20 A 20 20 0 0 1 70 25 A 15 15 0 0 1 70 50 Z" fill="url(#snowCloud)" />
        </g>
        <g className="anim-snow" fill="#FFFFFF">
          <circle cx="40" cy="65" r="3" />
          <circle cx="60" cy="60" r="2.5" />
          <circle cx="50" cy="75" r="3.5" />
          <circle cx="70" cy="70" r="2" />
        </g>
        {renderWindArrows()}
      </svg>
    );
  }

  // Fallback (unknown code)
  return (
    <svg className="weather-icon" viewBox="0 0 100 100" width="100%" height="100%">
      <circle cx="50" cy="50" r="20" fill="var(--text-secondary)" opacity="0.3" />
    </svg>
  );
};

export default WeatherIcon;
