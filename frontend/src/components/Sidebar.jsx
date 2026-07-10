import React, { useState, useEffect } from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(true);
  const tabs = ['NU', 'DETALJERAT', 'PROGNOS', 'INSTÄLLNINGAR'];

  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'DÖLJ' : 'MENY'}
      </button>
      <div className="sidebar-links">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`sidebar-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              if (window.innerWidth < 768) setIsOpen(false);
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
