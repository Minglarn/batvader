import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './TripPlanner.css';

function TripPlanner({ data, location }) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!data || !data.timeSeries) {
    return <h1>INGEN VÄDERDATA TILLGÄNGLIG</h1>;
  }

  const handlePlanTrip = async () => {
    if (!startTime || !endTime) {
      setError("Du måste välja både starttid och sluttid.");
      return;
    }
    
    if (new Date(startTime) >= new Date(endTime)) {
      setError("Sluttiden måste vara efter starttiden.");
      return;
    }
    
    setError(null);
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          start_time: startTime,
          end_time: endTime
        })
      });
      
      const resData = await response.json();
      if (resData.error) {
        setError(resData.error);
      } else {
        setResult(resData.result);
      }
    } catch (err) {
      setError("Ett fel uppstod vid kommunikation med backend.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('sv-SE', {weekday: 'short'})} ${d.toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}`;
  };

  return (
    <div className="trip-planner-container" style={{ padding: '20px' }}>
      
      <div className="trip-planner-sidebar">
        <h2 style={{ marginTop: 0, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '20px', textAlign: 'center' }}>
          Planera Resa
        </h2>
        
        <div className="info-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Från tid</label>
              <select 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="trip-planner-select"
              >
                <option value="">Välj starttid...</option>
                {data.timeSeries.slice(0, 48).map((hour, index) => (
                  <option key={`start-${index}`} value={hour.time}>{formatTime(hour.time)}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>Till tid</label>
              <select 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="trip-planner-select"
              >
                <option value="">Välj sluttid...</option>
                {data.timeSeries.slice(0, 48).map((hour, index) => (
                  <option key={`end-${index}`} value={hour.time}>{formatTime(hour.time)}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handlePlanTrip}
              disabled={loading}
              style={{ 
                marginTop: '10px',
                padding: '15px', 
                background: 'var(--accent)', 
                color: 'black', 
                border: 'none', 
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Genererar prognos...' : 'Generera AI-Prognos'}
            </button>
          </div>
          
          {error && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,0,0,0.2)', borderLeft: '4px solid #ff4444', color: 'white' }}>
              {error}
            </div>
          )}
          
          {result && result.status && (
            <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #2dc653', borderRadius: '8px', background: 'rgba(45,198,83,0.1)' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#2dc653', textTransform: 'uppercase', fontSize: '1rem' }}>Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>VIND:</span>
                  <span style={{ fontWeight: 'bold', color: result.status.vind === 'OK' ? '#2dc653' : result.status.vind === 'VARNING' ? '#ff4444' : '#f7b801' }}>{result.status.vind || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>TEMP:</span>
                  <span style={{ fontWeight: 'bold', color: result.status.temp === 'OK' ? '#2dc653' : result.status.temp === 'KALLT' ? '#8ecae6' : '#ff4444' }}>{result.status.temp || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>VÅGOR:</span>
                  <span style={{ fontWeight: 'bold', color: result.status.vagor === 'OK' ? '#2dc653' : result.status.vagor === 'VARNING' ? '#ff4444' : '#f7b801' }}>{result.status.vagor || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="trip-planner-main">
        {result && result.prognos ? (
          <div className="info-card" style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', overflowY: 'auto' }}>
            <div className="ai-markdown-content">
              <ReactMarkdown>{result.prognos}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="info-card" style={{ padding: '30px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <h3 style={{ color: 'var(--accent)', marginBottom: '15px' }}>Redo att ge dig av?</h3>
              <p style={{ lineHeight: '1.6' }}>Välj när du planerar att kasta loss och när du förväntar dig att vara framme. Jag analyserar väderdatan åt dig och ger en rekommendation på om det är en säker rutt!</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default TripPlanner;
