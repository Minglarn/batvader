import React from 'react';

// SMHI Wsymb2 code mapping:
// 1-3: Clear / Sun
// 4-7: Cloudy / Half clear
// 8-10, 18-20: Rain
// 11, 21: Thunder
// 12-17, 22-27: Snow

const WeatherIcon = ({ symbolCode }) => {
  const code = parseInt(symbolCode, 10);
  
  if (isNaN(code)) {
    return null;
  }

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
