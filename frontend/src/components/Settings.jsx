import React from 'react';

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '50px',
      height: '28px',
      background: checked ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)',
      borderRadius: '25px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.3s',
      flexShrink: 0
    }}
  >
    <div style={{
      width: '24px',
      height: '24px',
      background: '#fff',
      borderRadius: '50%',
      position: 'absolute',
      top: '2px',
      left: checked ? '24px' : '2px',
      transition: 'left 0.3s',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }} />
  </div>
);

const Settings = ({ theme, setTheme, dataSource, setDataSource }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: 'var(--text-secondary)', marginBottom: '20px', letterSpacing: '1px', textAlign: 'left' }}>UTSEENDE</h3>
      
      <div className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left', paddingRight: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Kustväder (Dynamiskt)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Animerat hav och himmel som reagerar på vädret. Inaktiverar OLED-läge.</div>
          </div>
          <ToggleSwitch 
            checked={theme === 'ocean'} 
            onChange={(checked) => setTheme(checked ? 'ocean' : 'oled')} 
          />
        </div>
      </div>

      <h3 style={{ color: 'var(--text-secondary)', marginTop: '40px', marginBottom: '20px', letterSpacing: '1px', textAlign: 'left' }}>VÄDERDATA (ATMOSFÄRISK)</h3>
      
      <div className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ textAlign: 'left', paddingRight: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>SMHI (Standard)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Svenska institutets prognoser.</div>
          </div>
          <input 
            type="radio" 
            name="dataSource" 
            value="smhi" 
            checked={dataSource === 'smhi'}
            onChange={(e) => setDataSource(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)', flexShrink: 0 }}
          />
        </label>

        <div style={{ height: '1px', background: 'var(--border-color)', margin: '5px 0' }}></div>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ textAlign: 'left', paddingRight: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>MET Norway</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Norska meteorologiska institutets data.</div>
          </div>
          <input 
            type="radio" 
            name="dataSource" 
            value="meteo" 
            checked={dataSource === 'meteo'}
            onChange={(e) => setDataSource(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)', flexShrink: 0 }}
          />
        </label>
        
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '5px 0' }}></div>

        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ textAlign: 'left', paddingRight: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Kombinerad (Medelvärde)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ett medelvärde av både SMHI och MET Norway.</div>
          </div>
          <input 
            type="radio" 
            name="dataSource" 
            value="average" 
            checked={dataSource === 'average'}
            onChange={(e) => setDataSource(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)', flexShrink: 0 }}
          />
        </label>
      </div>
    </div>
  );
};

export default Settings;
