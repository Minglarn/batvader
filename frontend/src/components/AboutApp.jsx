import React, { useState, useEffect } from 'react';

const AboutApp = () => {
  const [sysInfo, setSysInfo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && !sysInfo) {
      fetch('/api/sysinfo')
        .then(res => res.json())
        .then(data => setSysInfo(data))
        .catch(err => console.error("Kunde inte hämta systeminfo", err));
    }
  }, [isOpen, sysInfo]);

  return (
    <div style={{ marginTop: '20px', marginBottom: '20px', padding: '0 20px' }}>
      <details 
        onToggle={(e) => setIsOpen(e.target.open)}
        style={{
          backgroundColor: 'var(--bg-secondary, rgba(255,255,255,0.05))',
          borderRadius: '8px',
          padding: '10px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.1))'
        }}
      >
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          Om Applikationen
        </summary>
        <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          {sysInfo ? (
            <>
              <p><strong>Version (CalVer):</strong> {sysInfo.version}</p>
              <p><strong>Skapare:</strong> {sysInfo.creator}</p>
              <p><strong>Databasstorlek:</strong> {sysInfo.db_size_mb} MB</p>
            </>
          ) : (
            <p>Laddar information...</p>
          )}
        </div>
      </details>
    </div>
  );
};

export default AboutApp;
