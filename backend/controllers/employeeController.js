const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const attendanceValidation = require('../utils/attendanceValidation');
const { getClientIP } = require('../middleware/ipMiddleware');

exports.markAttendance = async (req, res) => {
  try {
    const { type, latitude, longitude, leaveRequestId } = req.body;
    const employeeId = req.user.id;

    if (!type) {
      return res.status(400).json({ error: 'Attendance type is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const validation = attendanceValidation.validateAttendanceType(
      type,
      employee,
      { latitude, longitude },
      leaveRequestId
    );

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const now = new Date();
    const localDateTime = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + ' ' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0') + ':' + 
                         String(now.getSeconds()).padStart(2, '0');

    const attendanceData = {
      employee_id: employeeId,
      check_in: localDateTime,
      attendance_type: type,
      ip_address: getClientIP(req)
    };

    if (type === 'work_office' && latitude && longitude) {
      attendanceData.latitude = latitude;
      attendanceData.longitude = longitude;
    }

    if (type === 'leave' && leaveRequestId) {
      attendanceData.leave_request_id = leaveRequestId;
    }

    await Attendance.markAttendanceWithType(attendanceData);
    const attendance = await Attendance.getByEmployeeId(employeeId, 1);

    res.status(201).json({
      message: `Attendance marked as ${attendanceValidation.getAttendanceTypeLabel(type)}`,
      attendance: attendance[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 30;

    const attendance = await Attendance.getByEmployeeId(employeeId, limit);
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceByType = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { type } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 30;

    const attendance = await Attendance.getByType(employeeId, type, limit);
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { password, ...profile } = employee;
    res.json({ employee: profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

