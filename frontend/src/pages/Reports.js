import React, { useState, useEffect } from 'react';
import AttendanceReport from '../components/AttendanceReport';
import AttendanceAnalytics from '../components/AttendanceAnalytics';

const Reports = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Refresh analytics when component mounts
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Reports</h1>

      <div className="dashboard-sections">
        <section className="analytics-section">
          <AttendanceAnalytics key={refreshKey} />
        </section>

        <section className="report-section">
          <AttendanceReport />
        </section>
      </div>
    </div>
  );
};

export default Reports;
