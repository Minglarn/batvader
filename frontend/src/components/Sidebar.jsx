import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  const tabs = ['NU', 'DETALJERAT', 'PROGNOS', 'INSTÄLLNINGAR'];

  return (
    <div className="sidebar">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`sidebar-btn ${activeTab === tab ? 'active' : ''}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default Sidebar;
