import React, { useEffect, useState } from 'react';

const AttendanceReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch attendance report from backend
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="attendance-report">
      <h2>Attendance Report</h2>
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {report.length === 0 && (
            <tr><td colSpan="4">No records found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceReport;
