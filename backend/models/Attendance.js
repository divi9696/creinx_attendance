const db = require('../config/db');

class Attendance {
  static async markAttendance(attendanceData) {
    const [result] = await db.execute(`
      INSERT INTO attendance (employee_id, check_in, attendance_type, ip_address, latitude, longitude, leave_request_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      attendanceData.employee_id,
      attendanceData.check_in,
      attendanceData.attendance_type,
      attendanceData.ip_address,
      attendanceData.latitude,
      attendanceData.longitude,
      attendanceData.leave_request_id
    ]);
    return result.insertId;
  }

  static async markAttendanceWithType(attendanceData) {
    return this.markAttendance(attendanceData);
  }

  static async getByEmployeeId(employeeId, limit = 30) {
    const [rows] = await db.execute(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY check_in DESC LIMIT ?',
      [parseInt(employeeId), parseInt(limit)]
    );
    return rows;
  }

  static async getByType(employeeId, type, limit = 30) {
    const [rows] = await db.execute(
      'SELECT * FROM attendance WHERE employee_id = ? AND attendance_type = ? ORDER BY check_in DESC LIMIT ?',
      [parseInt(employeeId), type, parseInt(limit)]
    );
    return rows;
  }

  static async getReport(startDate, endDate) {
    const [rows] = await db.execute(
      'SELECT * FROM attendance WHERE check_in BETWEEN ? AND ?',
      [startDate, endDate]
    );
    return rows;
  }

  static async getAttendanceByEmployeeAndDate(employeeId, date) {
    const [rows] = await db.execute(
      'SELECT * FROM attendance WHERE employee_id = ? AND DATE(check_in) = ? LIMIT 1',
      [parseInt(employeeId), date]
    );
    return rows[0];
  }

  static async getTodayCount(date = null) {
    const queryDate = date || new Date().toISOString().split('T')[0];
    const [rows] = await db.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN attendance_type = 'work_office' THEN 1 ELSE 0 END) as office,
        SUM(CASE WHEN attendance_type = 'work_home' THEN 1 ELSE 0 END) as home,
        SUM(CASE WHEN attendance_type = 'leave' THEN 1 ELSE 0 END) as leaves
      FROM attendance
      WHERE DATE(check_in) = ?
    `, [queryDate]);
    return rows[0];
  }

  static async getDailyAnalytics(startDate, endDate) {
    const [rows] = await db.execute(`
      SELECT
        DATE(check_in) as date,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN ? AND ?
      GROUP BY DATE(check_in), attendance_type
      ORDER BY date DESC, attendance_type
    `, [startDate, endDate]);
    return rows;
  }

  static async getWeeklyAnalytics(startDate, endDate) {
    const [rows] = await db.execute(`
      SELECT
        WEEK(check_in, 1) as week,
        YEAR(check_in) as year,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN ? AND ?
      GROUP BY year, week, attendance_type
      ORDER BY year DESC, week DESC, attendance_type
    `, [startDate, endDate]);
    return rows;
  }

  static async getMonthlyAnalytics(startDate, endDate) {
    const [rows] = await db.execute(`
      SELECT
        MONTH(check_in) as month,
        YEAR(check_in) as year,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN ? AND ?
      GROUP BY year, month, attendance_type
      ORDER BY year DESC, month DESC, attendance_type
    `, [startDate, endDate]);
    return rows;
  }
}

module.exports = Attendance;

