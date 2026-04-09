import React, { useState, useEffect } from 'react';

const AttendanceTypeSelector = ({ onTypeSelect, hasApprovedLeave }) => {
  const [selectedType, setSelectedType] = useState('work_office');
  const [leaveId, setLeaveId] = useState(null);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    onTypeSelect({ type, leaveId: type === 'leave' ? leaveId : null });
  };

  const handleLeaveSelect = (id) => {
    setLeaveId(id);
    if (selectedType === 'leave') {
      onTypeSelect({ type: 'leave', leaveId: id });
    }
  };

  return (
    <div className="attendance-type-selector">
      <h3>Select Attendance Type</h3>

      <div className="type-options">
        <div className="type-option">
          <input
            type="radio"
            id="work_office"
            name="attendanceType"
            value="work_office"
            checked={selectedType === 'work_office'}
            onChange={() => handleTypeChange('work_office')}
          />
          <label htmlFor="work_office">
            <strong>Work from Office</strong>
            <span className="description">Requires location within 100m radius</span>
          </label>
        </div>

        <div className="type-option">
          <input
            type="radio"
            id="work_home"
            name="attendanceType"
            value="work_home"
            checked={selectedType === 'work_home'}
            onChange={() => handleTypeChange('work_home')}
          />
          <label htmlFor="work_home">
            <strong>Work from Home</strong>
            <span className="description">No location validation required</span>
          </label>
        </div>

        <div className="type-option">
          <input
            type="radio"
            id="leave"
            name="attendanceType"
            value="leave"
            checked={selectedType === 'leave'}
            onChange={() => handleTypeChange('leave')}
            disabled={!hasApprovedLeave}
          />
          <label htmlFor="leave">
            <strong>Leave</strong>
            <span className="description">
              {hasApprovedLeave ? 'Mark as leave' : 'No approved leave today'}
            </span>
          </label>
        </div>
      </div>

      {selectedType === 'work_office' && (
        <div className="info-message">
          📍 Your location will be verified. You must be within the office geofence (100m radius) to mark attendance.
        </div>
      )}

      {selectedType === 'work_home' && (
        <div className="info-message">
          🏠 No location verification needed. Make sure you're working from home.
        </div>
      )}

      {selectedType === 'leave' && !hasApprovedLeave && (
        <div className="error-message">
          ❌ You don't have any approved leave for today. Submit a leave request first.
        </div>
      )}
    </div>
  );
};

export default AttendanceTypeSelector;
