const db = require('../config/db');

class Attendance {
  static markAttendance(attendanceData) {
    const stmt = db.prepare(`
      INSERT INTO attendance (employee_id, check_in, attendance_type, ip_address, latitude, longitude, leave_request_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      attendanceData.employee_id,
      attendanceData.check_in,
      attendanceData.attendance_type,
      attendanceData.ip_address,
      attendanceData.latitude,
      attendanceData.longitude,
      attendanceData.leave_request_id
    );
    return result.lastInsertRowid;
  }

  static markAttendanceWithType(attendanceData) {
    return this.markAttendance(attendanceData);
  }

  static getByEmployeeId(employeeId, limit = 30) {
    const stmt = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY check_in DESC LIMIT ?'
    );
    return stmt.all(employeeId, limit);
  }

  static getByType(employeeId, type, limit = 30) {
    const stmt = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND attendance_type = ? ORDER BY check_in DESC LIMIT ?'
    );
    return stmt.all(employeeId, type, limit);
  }

  static getReport(startDate, endDate) {
    const stmt = db.prepare(
      'SELECT * FROM attendance WHERE check_in BETWEEN ? AND ?'
    );
    return stmt.all(startDate, endDate);
  }

  static getAttendanceByEmployeeAndDate(employeeId, date) {
    const stmt = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND DATE(check_in) = ? LIMIT 1'
    );
    return stmt.get(employeeId, date);
  }

  static getTodayCount(date = null) {
    const queryDate = date || new Date().toISOString().split('T')[0];
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN attendance_type = 'work_office' THEN 1 ELSE 0 END) as office,
        SUM(CASE WHEN attendance_type = 'work_home' THEN 1 ELSE 0 END) as home,
        SUM(CASE WHEN attendance_type = 'leave' THEN 1 ELSE 0 END) as leaves
      FROM attendance
      WHERE DATE(check_in) = ?
    `);
    return stmt.get(queryDate);
  }

  static getDailyAnalytics(startDate, endDate) {
    const stmt = db.prepare(`
      SELECT
        DATE(check_in) as date,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN ? AND ?
      GROUP BY DATE(check_in), attendance_type
      ORDER BY date DESC, attendance_type
    `);
    return stmt.all(startDate, endDate);
  }

  static getWeeklyAnalytics(startDate, endDate) {
    const stmt = db.prepare(`
      SELECT
        strftime('%W', check_in) as week,
        strftime('%Y', check_in) as year,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN ? AND ?
      GROUP BY strftime('%W', check_in), strftime('%Y', check_in), attendance_type
      ORDER BY year DESC, week DESC, attendance_type
    `);
    return stmt.all(startDate, endDate);
  }

  static getMonthlyAnalytics(startDate, endDate) {
    const stmt = db.prepare(`
      SELECT
        strftime('%m', check_in) as month,
        strftime('%Y', check_in) as year,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN ? AND ?
      GROUP BY strftime('%Y', check_in), strftime('%m', check_in), attendance_type
      ORDER BY year DESC, month DESC, attendance_type
    `);
    return stmt.all(startDate, endDate);
  }
}

module.exports = Attendance;
