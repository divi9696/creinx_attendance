const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');
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

    const validation = await attendanceValidation.validateAttendanceType(
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

exports.getTodayStatus = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                 String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(now.getDate()).padStart(2, '0');
    
    const attendance = await Attendance.getAttendanceByEmployeeAndDate(employeeId, today);
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.handleCheckout = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const now = new Date();
    const localDateTime = now.getFullYear() + '-' + 
                         String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(now.getDate()).padStart(2, '0') + ' ' + 
                         String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0') + ':' + 
                         String(now.getSeconds()).padStart(2, '0');

    const success = await Attendance.checkOut(employeeId, localDateTime);
    
    if (!success) {
      return res.status(400).json({ error: 'No active session found to check out from today.' });
    }

    res.json({ message: 'Departure initialized successfully. Have a great day!', check_out: localDateTime });
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

exports.getMonthlyReport = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear  = year  ? parseInt(year)  : now.getFullYear();

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay   = new Date(targetYear, targetMonth, 0).getDate();
    const endDate   = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

    // Today as YYYY-MM-DD (no timezone shift — use local parts)
    const todayStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    const [employee, attendanceRaw, leaves] = await Promise.all([
      Employee.findById(employeeId),
      Attendance.getByDateRange(employeeId, startDate, endDate),
      LeaveRequest.findByEmployeeId(employeeId)
    ]);

    const joinDateStr = employee?.date_of_join 
      ? new Date(employee.date_of_join).toISOString().split('T')[0] 
      : '1970-01-01';

    const attendance = attendanceRaw.filter(a => a.check_in.substring(0, 10) >= joinDateStr);

    // Build set of days that have actual attendance records
    const markedDays = new Set(
      attendance.map(a => a.check_in.substring(0, 10))
    );

    // Compute all working weekdays (Mon–Fri) in the month up to today
    const workingDays = [];
    const cursor = new Date(startDate + 'T00:00:00');
    while (true) {
      const dateStr = cursor.getFullYear() + '-' +
        String(cursor.getMonth() + 1).padStart(2, '0') + '-' +
        String(cursor.getDate()).padStart(2, '0');
      if (dateStr > endDate || dateStr > todayStr) break;
      const dow = cursor.getDay(); // 0=Sun, 6=Sat
      if (dow !== 0 && dow !== 6 && dateStr >= joinDateStr) workingDays.push(dateStr);
      cursor.setDate(cursor.getDate() + 1);
    }

    // Absent = working day with no attendance record
    const absentDays = workingDays.filter(d => !markedDays.has(d));

    const stats = {
      working: workingDays.length,
      office:  attendance.filter(a => a.attendance_type === 'work_office').length,
      home:    attendance.filter(a => a.attendance_type === 'work_home').length,
      leave:   attendance.filter(a => a.attendance_type === 'leave').length,
      absent:  absentDays.length,
      total:   attendance.length
    };

    res.json({ attendance, leaves, stats, absentDays, month: targetMonth, year: targetYear, startDate, endDate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

