import React, { useState } from 'react';

const AttendanceTypeSelector = ({ onTypeSelect, hasApprovedLeave }) => {
  const [selectedType, setSelectedType] = useState('work_office');

  const handleTypeChange = (type) => {
    setSelectedType(type);
    onTypeSelect({ type, leaveId: null }); // leaveId logic simplified for now
  };

  const types = [
    { id: 'work_office', label: 'Work from Office', desc: 'Verified 100m geofence', icon: '🏢', color: 'cyan' },
    { id: 'work_home', label: 'Work from Home', desc: 'Remote access enabled', icon: '🏠', color: 'purple' },
    { id: 'leave', label: 'On Leave', desc: hasApprovedLeave ? 'Approved for today' : 'No approved leave', icon: '📅', color: 'red', disabled: !hasApprovedLeave },
  ];

  return (
    <div className="premium-selector">
      <div className="selector-grid">
        {types.map((type) => (
          <div 
            key={type.id} 
            className={`type-card ${selectedType === type.id ? 'active' : ''} ${type.disabled ? 'disabled' : ''}`}
            onClick={() => !type.disabled && handleTypeChange(type.id)}
          >
            <div className={`card-glow glow-${type.color}`}></div>
            <div className="card-content">
              <span className="type-icon">{type.icon}</span>
              <div className="type-text">
                <span className="type-label">{type.label}</span>
                <span className="type-desc">{type.desc}</span>
              </div>
              <div className="selection-indicator">
                <div className="inner-dot"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel notice-box animate-fade-in">
        {selectedType === 'work_office' ? (
          <p>📍 <strong>Geofencing Active:</strong> Your location coordinates will be cross-referenced with the office HQ. Please ensure GPS is active.</p>
        ) : selectedType === 'work_home' ? (
          <p>🔓 <strong>Remote Mode:</strong> No geofence verification required. Your session will be logged via IP address.</p>
        ) : (
          <p>🛌 <strong>Leave Mode:</strong> Attendance will be marked against your approved leave request.</p>
        )}
      </div>

      <style jsx>{`
        .premium-selector { width: 100%; margin-bottom: 30px; }
        .selector-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
        
        .type-card { 
          position: relative; overflow: hidden; background: rgba(255, 255, 255, 0.03); 
          border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; 
          cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .type-card:hover:not(.disabled) { transform: translateY(-5px); background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.2); }
        .type-card.active { background: rgba(255, 255, 255, 0.08); border-color: var(--primary-glow); box-shadow: 0 0 20px rgba(0, 210, 255, 0.1); }
        .type-card.disabled { opacity: 0.4; cursor: not-allowed; grayscale: 1; }

        .card-content { display: flex; align-items: flex-start; gap: 12px; z-index: 2; position: relative; }
        .type-icon { font-size: 1.5rem; }
        .type-text { flex: 1; flex-direction: column; display: flex; }
        .type-label { font-weight: 700; font-size: 0.9rem; color: #fff; margin-bottom: 4px; }
        .type-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.3; }

        .selection-indicator { width: 18px; height: 18px; border: 2px solid var(--glass-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
        .active .selection-indicator { border-color: var(--primary-glow); }
        .inner-dot { width: 8px; height: 8px; background: var(--primary-glow); border-radius: 50%; transform: scale(0); transition: var(--transition); }
        .active .inner-dot { transform: scale(1); box-shadow: 0 0 8px var(--primary-glow); }

        .notice-box { padding: 15px 20px; background: rgba(0, 210, 255, 0.05); border-color: rgba(0, 210, 255, 0.1); }
        .notice-box p { font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.5; }
        .notice-box strong { color: var(--primary-glow); }

        @media (max-width: 800px) { .selector-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AttendanceTypeSelector;
