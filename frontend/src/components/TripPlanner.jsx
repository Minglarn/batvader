import React, { useState } from 'react';

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
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
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
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', outline: 'none' }}
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
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', outline: 'none' }}
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
      </div>

      {result && (
        <div className="info-card" style={{ padding: '20px', flexGrow: 1 }}>
          <h3 style={{ marginTop: 0, color: 'var(--accent)' }}>AI Bedömning</h3>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

export default TripPlanner;
