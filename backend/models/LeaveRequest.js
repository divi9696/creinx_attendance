const db = require('../config/db');

class LeaveRequest {
  static async create(leaveData) {
    const [result] = await db.execute(`
      INSERT INTO leave_requests (employee_id, start_date, end_date, reason)
      VALUES (?, ?, ?, ?)
    `, [
      leaveData.employee_id,
      leaveData.start_date,
      leaveData.end_date,
      leaveData.reason
    ]);
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM leave_requests WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmployeeId(employeeId) {
    const [rows] = await db.execute(
      'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC',
      [employeeId]
    );
    return rows;
  }

  static async findPendingRequests(limit = 20, offset = 0) {
    const lim = parseInt(limit, 10);
    const off = parseInt(offset, 10);
    const [rows] = await db.execute(`
      SELECT lr.*, e.name as employee_name, e.email as employee_email
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.status = 'pending'
      ORDER BY lr.created_at DESC
      LIMIT ${lim} OFFSET ${off}
    `);
    return rows;
  }

  static async updateStatus(id, status, reviewedBy = null, declineReason = null) {
    const [result] = await db.execute(`
      UPDATE leave_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, decline_reason = ? WHERE id = ?
    `, [status, reviewedBy, declineReason, id]);
    return result.affectedRows > 0;
  }

  static async getByDateRange(employeeId, startDate, endDate) {
    const [rows] = await db.execute(`
      SELECT * FROM leave_requests
      WHERE employee_id = ?
      AND status = 'approved'
      AND (
        (start_date <= ? AND end_date >= ?)
        OR (start_date >= ? AND start_date <= ?)
        OR (end_date >= ? AND end_date <= ?)
      )
    `, [employeeId, endDate, startDate, startDate, endDate, startDate, endDate]);
    return rows;
  }

  static async getByDateRangeForEmployee(employeeId, date) {
    const [rows] = await db.execute(`
      SELECT * FROM leave_requests
      WHERE employee_id = ?
      AND status = 'approved'
      AND start_date <= ?
      AND end_date >= ?
    `, [employeeId, date, date]);
    return rows[0];
  }

  static async getAnalytics(startDate, endDate) {
    const [rows] = await db.execute(`
      SELECT
        status,
        COUNT(*) as count,
        COUNT(DISTINCT employee_id) as employee_count
      FROM leave_requests
      WHERE start_date >= ? AND end_date <= ?
      GROUP BY status
    `, [startDate, endDate]);
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM leave_requests WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = LeaveRequest;

