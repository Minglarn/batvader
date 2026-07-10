import React, { useState, useRef } from 'react';
import WeatherNow from './WeatherNow';

function WeatherDetailed({ data }) {
  const [selectedHourIndex, setSelectedHourIndex] = useState(0);
  const touchStartX = useRef(null);

  if (!data || !data.timeSeries || data.timeSeries.length === 0) {
    return <div className="no-data">INGEN DATA</div>;
  }

  const timeSeries = data.timeSeries;
  const currentData = timeSeries[selectedHourIndex];

  // Parse time
  const validTime = new Date(currentData.time);
  const timeString = validTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  const dateString = validTime.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });

  const handlePrev = () => {
    setSelectedHourIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setSelectedHourIndex(prev => Math.min(timeSeries.length - 1, prev + 1));
  };

  // Touch logic for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      // Swiped left (next hour)
      handleNext();
    } else if (diff < -50) {
      // Swiped right (prev hour)
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div 
      className="weather-detailed"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <div className="time-navigation" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button 
          onClick={handlePrev} 
          disabled={selectedHourIndex === 0}
          className="nav-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)' }}>{timeString}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{dateString}</div>
        </div>
        <button 
          onClick={handleNext} 
          disabled={selectedHourIndex === timeSeries.length - 1}
          className="nav-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div style={{ flexGrow: 1 }}>
        <WeatherNow data={{ timeSeries: [currentData] }} />
      </div>
    </div>
  );
}

export default WeatherDetailed;
