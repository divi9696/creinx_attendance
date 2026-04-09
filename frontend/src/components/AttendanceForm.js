import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceTypeSelector from './AttendanceTypeSelector';

const AttendanceForm = ({ onSuccess }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceType, setAttendanceType] = useState({ type: 'work_office', leaveId: null });
  const [hasApprovedLeave, setHasApprovedLeave] = useState(false);

  useEffect(() => {
    // Check if employee has approved leave today
    checkApprovedLeave();
  }, []);

  const checkApprovedLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const today = new Date().toISOString().split('T')[0];
      const approvedLeaveToday = response.data.leaves?.some(leave =>
        leave.status === 'approved' &&
        leave.start_date <= today &&
        leave.end_date >= today
      );
      setHasApprovedLeave(approvedLeaveToday || false);
    } catch (err) {
      console.error('Error checking leave status:', err);
    }
  };

  const handleAttendanceTypeSelect = (type) => {
    setAttendanceType(type);
  };

  const handleMarkAttendance = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (attendanceType.type === 'work_office') {
        if (!navigator.geolocation) {
          setError('Geolocation is not supported by your browser');
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await submitAttendance(latitude, longitude);
          },
          (error) => {
            setError('Failed to get your location. Please enable location access.');
            setLoading(false);
          }
        );
      } else {
        await submitAttendance(null, null);
      }
    } catch (error) {
      setError('Error marking attendance');
      setLoading(false);
    }
  };

  const submitAttendance = async (latitude = null, longitude = null) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        type: attendanceType.type,
        latitude,
        longitude,
        leaveRequestId: attendanceType.leaveId
      };

      const response = await axios.post(
        'http://localhost:5001/api/employee/attendance',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setLocation(latitude && longitude ? { latitude, longitude } : null);
      setAttendanceType({ type: 'work_office', leaveId: null });

      if (onSuccess) onSuccess();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-form">
      <h2>Mark Attendance</h2>

      <AttendanceTypeSelector
        onTypeSelect={handleAttendanceTypeSelect}
        hasApprovedLeave={hasApprovedLeave}
      />

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button
        onClick={handleMarkAttendance}
        disabled={loading || (attendanceType.type === 'leave' && !hasApprovedLeave)}
        className="mark-attendance-btn"
      >
        {loading ? 'Processing...' : 'Mark Attendance'}
      </button>

      {location && (
        <div className="location-info">
          <p>📍 Location verified: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;
