const db = require('../config/db');

class LeaveRequest {
  static create(leaveData) {
    const stmt = db.prepare(`
      INSERT INTO leave_requests (employee_id, start_date, end_date, reason)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      leaveData.employee_id,
      leaveData.start_date,
      leaveData.end_date,
      leaveData.reason
    );
    return result.lastInsertRowid;
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM leave_requests WHERE id = ?');
    return stmt.get(id);
  }

  static findByEmployeeId(employeeId) {
    const stmt = db.prepare(
      'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC'
    );
    return stmt.all(employeeId);
  }

  static findPendingRequests(limit = 20, offset = 0) {
    const stmt = db.prepare(`
      SELECT lr.*, e.name as employee_name, e.email as employee_email
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.status = 'pending'
      ORDER BY lr.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  }

  static updateStatus(id, status, reviewedBy = null, declineReason = null) {
    const stmt = db.prepare(`
      UPDATE leave_requests SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, decline_reason = ? WHERE id = ?
    `);
    const result = stmt.run(status, reviewedBy, declineReason, id);
    return result.changes > 0;
  }

  static getByDateRange(employeeId, startDate, endDate) {
    const stmt = db.prepare(`
      SELECT * FROM leave_requests
      WHERE employee_id = ?
      AND status = 'approved'
      AND (
        (start_date <= ? AND end_date >= ?)
        OR (start_date >= ? AND start_date <= ?)
        OR (end_date >= ? AND end_date <= ?)
      )
    `);
    return stmt.all(employeeId, endDate, startDate, startDate, endDate, startDate, endDate);
  }

  static getByDateRangeForEmployee(employeeId, date) {
    const stmt = db.prepare(`
      SELECT * FROM leave_requests
      WHERE employee_id = ?
      AND status = 'approved'
      AND start_date <= ?
      AND end_date >= ?
    `);
    return stmt.get(employeeId, date, date);
  }

  static getAnalytics(startDate, endDate) {
    const stmt = db.prepare(`
      SELECT
        status,
        COUNT(*) as count,
        COUNT(DISTINCT employee_id) as employee_count
      FROM leave_requests
      WHERE start_date >= ? AND end_date <= ?
      GROUP BY status
    `);
    return stmt.all(startDate, endDate);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM leave_requests WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

module.exports = LeaveRequest;
