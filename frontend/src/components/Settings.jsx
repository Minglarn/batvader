import React, { useState } from 'react';

const ToggleSwitch = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    style={{
      width: '50px',
      height: '28px',
      background: checked ? 'var(--accent)' : 'var(--border-color)',
      borderRadius: '25px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.3s',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0
    }}
  >
    <div style={{
      width: '24px',
      height: '24px',
      background: '#ffffff',
      borderRadius: '50%',
      position: 'absolute',
      top: '1px',
      left: checked ? '23px' : '1px',
      transition: 'left 0.3s',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }} />
  </div>
);

const CollapsibleCard = ({ title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      borderRadius: '8px',
      marginBottom: '15px',
      border: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '18px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid var(--border-color)' : 'none',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{title}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', color: 'var(--accent)' }}>
           <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      {isOpen && (
        <div style={{ padding: '0' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const SettingsRow = ({ title, description, control, hasBorder = true }) => (
  <label style={{
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: hasBorder ? '1px solid var(--border-color)' : 'none',
    cursor: 'pointer',
    margin: 0
  }}>
    <div style={{ textAlign: 'left', paddingRight: '20px' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '5px' }}>{title}</div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{description}</div>
    </div>
    <div style={{ flexShrink: 0 }}>
      {control}
    </div>
  </label>
);

const Settings = ({ theme, setTheme, dataSource, setDataSource }) => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      <CollapsibleCard title="Färgtema" defaultOpen={true}>
        <SettingsRow 
          title="Kustväder (Dynamiskt)" 
          description="Animerat hav och himmel som reagerar på vädret. Inaktiverar OLED-läge." 
          hasBorder={false}
          control={
            <ToggleSwitch 
              checked={theme === 'ocean'} 
              onChange={(checked) => setTheme(checked ? 'ocean' : 'oled')} 
            />
          }
        />
      </CollapsibleCard>

      <CollapsibleCard title="Väderdata (Atmosfärisk)" defaultOpen={true}>
        <SettingsRow 
          title="SMHI (Standard)" 
          description="Svenska institutets prognoser. Oftast bäst för lokala förhållanden." 
          control={
            <input 
              type="radio" 
              name="dataSource" 
              value="smhi" 
              checked={dataSource === 'smhi'}
              onChange={(e) => setDataSource(e.target.value)}
              style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          }
        />
        <SettingsRow 
          title="MET Norway" 
          description="Norska meteorologiska institutets data." 
          control={
            <input 
              type="radio" 
              name="dataSource" 
              value="meteo" 
              checked={dataSource === 'meteo'}
              onChange={(e) => setDataSource(e.target.value)}
              style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          }
        />
        <SettingsRow 
          title="Kombinerad (Medelvärde)" 
          description="Ett medelvärde av både SMHI och MET Norway." 
          hasBorder={false}
          control={
            <input 
              type="radio" 
              name="dataSource" 
              value="average" 
              checked={dataSource === 'average'}
              onChange={(e) => setDataSource(e.target.value)}
              style={{ transform: 'scale(1.5)', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
          }
        />
      </CollapsibleCard>

    </div>
  );
};

export default Settings;
