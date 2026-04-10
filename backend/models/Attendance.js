const db = require('../config/db');

class Attendance {
  static async markAttendance(attendanceData) {
    // Ultimate Bypass: Safety Casting & Direct Query
    const empId = parseInt(attendanceData.employee_id);
    const checkIn = attendanceData.check_in;
    const type = attendanceData.attendance_type;
    const ip = attendanceData.ip_address ? `'${attendanceData.ip_address}'` : 'NULL';
    const lat = attendanceData.latitude !== undefined && attendanceData.latitude !== null ? parseFloat(attendanceData.latitude) : 'NULL';
    const lon = attendanceData.longitude !== undefined && attendanceData.longitude !== null ? parseFloat(attendanceData.longitude) : 'NULL';
    const leaveId = attendanceData.leave_request_id !== undefined && attendanceData.leave_request_id !== null ? parseInt(attendanceData.leave_request_id) : 'NULL';

    const sql = `
      INSERT INTO attendance 
      (employee_id, check_in, attendance_type, ip_address, latitude, longitude, leave_request_id)
      VALUES (${empId}, '${checkIn}', '${type}', ${ip}, ${lat}, ${lon}, ${leaveId})
    `;

    const [result] = await db.query(sql);
    return result.insertId;
  }

  static async markAttendanceWithType(attendanceData) {
    return this.markAttendance(attendanceData);
  }

  static async getByEmployeeId(employeeId, limit = 30) {
    const [rows] = await db.query(
      `SELECT * FROM attendance WHERE employee_id = ${parseInt(employeeId)} ORDER BY check_in DESC LIMIT ${parseInt(limit)}`
    );
    return rows;
  }

  static async getByType(employeeId, type, limit = 30) {
    const [rows] = await db.query(
      `SELECT * FROM attendance WHERE employee_id = ${parseInt(employeeId)} AND attendance_type = '${type}' ORDER BY check_in DESC LIMIT ${parseInt(limit)}`
    );
    return rows;
  }

  static async getReport(startDate, endDate) {
    const [rows] = await db.query(
      `SELECT * FROM attendance WHERE check_in BETWEEN '${startDate}' AND '${endDate}'`
    );
    return rows;
  }

  static async getAttendanceByEmployeeAndDate(employeeId, date) {
    const [rows] = await db.query(
      `SELECT * FROM attendance WHERE employee_id = ${parseInt(employeeId)} AND DATE(check_in) = '${date}' LIMIT 1`
    );
    return rows[0];
  }

  static async getTodayCount(date = null) {
    const queryDate = date || new Date().toISOString().split('T')[0];
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN attendance_type = 'work_office' THEN 1 ELSE 0 END) as office,
        SUM(CASE WHEN attendance_type = 'work_home' THEN 1 ELSE 0 END) as home,
        SUM(CASE WHEN attendance_type = 'leave' THEN 1 ELSE 0 END) as leaves
      FROM attendance
      WHERE DATE(check_in) = '${queryDate}'
    `);
    return rows[0];
  }

  static async getDailyAnalytics(startDate, endDate) {
    const [rows] = await db.query(`
      SELECT
        DATE(check_in) as date,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY DATE(check_in), attendance_type
      ORDER BY date DESC, attendance_type
    `);
    return rows;
  }

  static async getWeeklyAnalytics(startDate, endDate) {
    const [rows] = await db.query(`
      SELECT
        WEEK(check_in, 1) as week,
        YEAR(check_in) as year,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY year, week, attendance_type
      ORDER BY year DESC, week DESC, attendance_type
    `);
    return rows;
  }

  static async getMonthlyAnalytics(startDate, endDate) {
    const [rows] = await db.query(`
      SELECT
        MONTH(check_in) as month,
        YEAR(check_in) as year,
        attendance_type,
        COUNT(*) as count
      FROM attendance
      WHERE check_in BETWEEN '${startDate}' AND '${endDate}'
      GROUP BY year, month, attendance_type
      ORDER BY year DESC, month DESC, attendance_type
    `);
    return rows;
  }
}

module.exports = Attendance;
