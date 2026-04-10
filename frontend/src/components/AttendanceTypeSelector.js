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
          position: relative; overflow: hidden; background: rgba(30, 41, 59, 0.4); 
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 24px; 
          cursor: pointer; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .type-card:hover:not(.disabled) { transform: translateY(-5px); background: rgba(51, 65, 85, 0.6); border-color: #4deaff; }
        .type-card.active { background: rgba(0, 210, 255, 0.1); border-color: #4deaff; box-shadow: 0 0 30px rgba(0, 210, 255, 0.15); }
        .type-card.disabled { opacity: 0.3; cursor: not-allowed; }

        .card-content { display: flex; align-items: flex-start; gap: 15px; z-index: 2; position: relative; }
        .type-icon { font-size: 1.8rem; }
        .type-text { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .type-label { font-weight: 800; font-size: 1rem; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
        .type-desc { font-size: 0.8rem; color: #cbd5e1; font-weight: 500; line-height: 1.4; }

        .selection-indicator { width: 22px; height: 22px; border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
        .active .selection-indicator { border-color: #4deaff; background: rgba(0, 210, 255, 0.1); }
        .inner-dot { width: 10px; height: 10px; background: #4deaff; border-radius: 50%; transform: scale(0); transition: var(--transition); }
        .active .inner-dot { transform: scale(1); box-shadow: 0 0 12px #4deaff; }

        .notice-box { padding: 18px 25px; background: rgba(13, 148, 136, 0.1); border: 1px solid rgba(13, 148, 136, 0.2); border-radius: 16px; }
        .notice-box p { font-size: 0.85rem; color: #cbd5e1; margin: 0; line-height: 1.6; font-weight: 500; }
        .notice-box strong { color: #4deaff; font-weight: 800; }

        @media (max-width: 800px) { .selector-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default AttendanceTypeSelector;
