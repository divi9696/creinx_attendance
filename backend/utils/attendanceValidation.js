const geoUtils = require('./geoUtils');
const LeaveRequest = require('../models/LeaveRequest');

exports.validateAttendanceType = async (type, userData, locationData = null, leaveRequestId = null) => {
  try {
    // === TIME RESTRICTION CHECK (10:00 AM - 10:30 AM) ===
    // Only apply to Work from Office and Work from Home. Leave doesn't require active check-in during this window.
    if (type === 'work_office' || type === 'work_home') {
      const now = new Date();
      // Use IST (UTC+5:30) for consistency
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const hours = istTime.getUTCHours();
      const minutes = istTime.getUTCMinutes();
      
      const currentTimeInMinutes = hours * 60 + minutes;
      const startWindow = 10 * 60; // 10:00 AM
      const endWindow = 10 * 60 + 30; // 10:30 AM

      if (currentTimeInMinutes < startWindow || currentTimeInMinutes > endWindow) {
        return { 
          valid: false, 
          error: `Attendance window is closed. (Open: 10:00 AM - 10:30 AM). Your current time: ${hours}:${minutes < 10 ? '0'+minutes : minutes}` 
        };
      }
    }

    if (type === 'work_office') {
      if (!locationData || !locationData.latitude || !locationData.longitude) {
        return { valid: false, error: 'Location is required for work from office' };
      }

      const officeCoords = {
        lat: parseFloat(process.env.OFFICE_LATITUDE || 40.7128),
        lon: parseFloat(process.env.OFFICE_LONGITUDE || -74.0060)
      };

      const isWithinOffice = geoUtils.isWithinOffice(
        locationData.latitude,
        locationData.longitude,
        officeCoords.lat,
        officeCoords.lon,
        0.1
      );

      if (!isWithinOffice) {
        return { valid: false, error: 'You are not within the office geofence (100m radius)' };
      }

      return { valid: true };
    }

    if (type === 'work_home') {
      return { valid: true };
    }

    if (type === 'leave') {
      if (!leaveRequestId) {
        return { valid: false, error: 'Leave request ID is required' };
      }

      const leave = await LeaveRequest.findById(leaveRequestId);
      if (!leave) {
        return { valid: false, error: 'Leave request not found' };
      }

      if (leave.status !== 'approved') {
        return { valid: false, error: 'Leave request is not approved' };
      }

      const today = new Date().toISOString().split('T')[0];
      const startDate = typeof leave.start_date === 'string' ? leave.start_date : leave.start_date;
      const endDate = typeof leave.end_date === 'string' ? leave.end_date : leave.end_date;

      if (today < startDate || today > endDate) {
        return { valid: false, error: 'Leave request date range does not include today' };
      }

      return { valid: true, leaveId: leave.id };
    }

    return { valid: false, error: 'Invalid attendance type' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

exports.getAttendanceTypeLabel = (type) => {
  const labels = {
    work_office: 'Work from Office',
    work_home: 'Work from Home',
    leave: 'Leave'
  };
  return labels[type] || type;
};

exports.checkLeaveConflict = (employeeId, date) => {
  try {
    const leave = LeaveRequest.getByDateRangeForEmployee(employeeId, date);
    return leave ? { hasLeave: true, leave } : { hasLeave: false };
  } catch (error) {
    throw error;
  }
};

