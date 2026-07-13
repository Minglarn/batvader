import React from 'react';

const Settings = ({ theme, setTheme, dataSource, setDataSource }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: 'var(--text-secondary)', marginBottom: '20px', letterSpacing: '1px' }}>UTSEENDE</h3>
      
      <div className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="theme" 
            value="oled" 
            checked={theme === 'oled'}
            onChange={(e) => setTheme(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>OLED Mörkt (Standard)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Solid svart bakgrund. Perfekt för OLED-skärmar och minimal batteriförbrukning.</div>
          </div>
        </label>

        <div style={{ height: '1px', background: 'var(--border-color)', margin: '10px 0' }}></div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="theme" 
            value="ocean" 
            checked={theme === 'ocean'}
            onChange={(e) => setTheme(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Kustväder (Dynamiskt)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Animerat hav och himmel som reagerar på väder och tid på dygnet. Glassmorphism-design.</div>
          </div>
        </label>
      </div>

      <h3 style={{ color: 'var(--text-secondary)', marginTop: '40px', marginBottom: '20px', letterSpacing: '1px' }}>VÄDERDATA (ATMOSFÄRISK)</h3>
      
      <div className="info-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="dataSource" 
            value="smhi" 
            checked={dataSource === 'smhi'}
            onChange={(e) => setDataSource(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>SMHI (Standard)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Svenska institutets prognoser.</div>
          </div>
        </label>

        <div style={{ height: '1px', background: 'var(--border-color)', margin: '10px 0' }}></div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="dataSource" 
            value="meteo" 
            checked={dataSource === 'meteo'}
            onChange={(e) => setDataSource(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>MET Norway</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Norska meteorologiska institutets data.</div>
          </div>
        </label>
        
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '10px 0' }}></div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
          <input 
            type="radio" 
            name="dataSource" 
            value="average" 
            checked={dataSource === 'average'}
            onChange={(e) => setDataSource(e.target.value)}
            style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Kombinerad (Medelvärde)</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ett medelvärde av både SMHI och MET Norway. Saknas data i ena används den andra.</div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default Settings;
