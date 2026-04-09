import React, { useState } from 'react';
import AttendanceForm from '../components/AttendanceForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import LeaveStatusWidget from '../components/LeaveStatusWidget';

const EmployeeDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAttendanceSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleLeaveSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="employee-dashboard">
      <h1>Employee Dashboard</h1>

      <div className="dashboard-sections">
        <section className="attendance-section">
          <AttendanceForm onSuccess={handleAttendanceSuccess} />
        </section>

        <section className="leave-request-section">
          <LeaveRequestForm onSuccess={handleLeaveSuccess} />
        </section>

        <section className="leave-status-section">
          <LeaveStatusWidget key={refreshKey} />
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
