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
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the incomplete line in the buffer
          
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const resData = JSON.parse(line);
              if (resData.status === 'progress') {
                // Update a hypothetical state, or we can just update a DOM element if we had a ref.
                // Since we don't have a loadingText state, let's use document.getElementById or add a state.
                const btn = document.getElementById('ai-generate-btn');
                if (btn) btn.innerText = `Genererar... (${resData.tokens} tokens)`;
              } else if (resData.status === 'done') {
                setResult(resData.result);
              } else if (resData.status === 'error' || resData.error) {
                setError(resData.error || "Ett fel uppstod.");
              }
            } catch (err) {
              console.error("Fel vid parsning av ström:", err);
            }
          }
        }
      }
      
    } catch (err) {
      setError("Ett fel uppstod vid kommunikation med backend.");
    } finally {
      setLoading(false);
      const btn = document.getElementById('ai-generate-btn');
      if (btn) btn.innerText = 'Generera AI-Prognos';
    }
  };

  React.useEffect(() => {
    const fetchLatestPlan = async () => {
      try {
        const response = await fetch('/api/plan-trip/latest');
        if (response.ok) {
          const data = await response.json();
          if (data && data.result) {
            setResult(data.result);
            if (data.start_time) setStartTime(data.start_time);
            if (data.end_time) setEndTime(data.end_time);
          }
        }
      } catch (err) {
        console.error("Kunde inte hämta sparad prognos:", err);
      }
    };
    fetchLatestPlan();
  }, []);

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('sv-SE', {weekday: 'short'})} ${d.toLocaleTimeString('sv-SE', {hour: '2-digit', minute: '2-digit'})}`;
  };

  return (
    <div className="trip-planner-container">
      
      <div className="trip-planner-sidebar">
        <div className="info-card no-hover" style={{ padding: '20px', marginBottom: '20px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
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
              id="ai-generate-btn"
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
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              {loading ? 'Genererar prognos...' : 'Generera AI-Prognos'}
            </button>
          </div>
        </div>
          
        {error && (
          <div className="info-card no-hover" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ff4444', color: 'white', width: '100%' }}>
            {error}
          </div>
        )}
          
        {result && result.status && (
          <div className="info-card no-hover" style={{ padding: '20px', width: '100%', alignItems: 'stretch' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', textAlign: 'center', letterSpacing: '1px' }}>Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>VIND:</span>
                <span style={{ fontWeight: 'bold', color: result.status.vind === 'OK' ? '#2dc653' : result.status.vind === 'VARNING' ? '#ff4444' : '#f7b801' }}>{result.status.vind || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>TEMP:</span>
                <span style={{ fontWeight: 'bold', color: result.status.temp === 'OK' ? '#2dc653' : result.status.temp === 'KALLT' ? '#8ecae6' : '#ff4444' }}>{result.status.temp || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>VÅGOR:</span>
                <span style={{ fontWeight: 'bold', color: result.status.vagor === 'OK' ? '#2dc653' : result.status.vagor === 'VARNING' ? '#ff4444' : '#f7b801' }}>{result.status.vagor || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="trip-planner-main">
        {result && result.prognos ? (
          <div className="info-card no-hover" style={{ padding: '30px', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', overflowY: 'auto', maxHeight: '600px' }}>
            <div className="ai-markdown-content">
              <ReactMarkdown>{result.prognos}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="info-card no-hover" style={{ padding: '30px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
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
