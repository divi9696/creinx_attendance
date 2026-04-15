const db = require('../config/db');

class LatePermission {
  static async create(data) {
    const [result] = await db.execute(`
      INSERT INTO late_permissions (employee_id, granted_by, permission_date, reason)
      VALUES (?, ?, ?, ?)
    `, [data.employee_id, data.granted_by, data.permission_date, data.reason || null]);
    return result.insertId;
  }

  static async findForEmployeeToday(employeeId) {
    const now = new Date();
    const today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    const [rows] = await db.execute(`
      SELECT lp.*, e.name as granted_by_name
      FROM late_permissions lp
      JOIN employees e ON lp.granted_by = e.id
      WHERE lp.employee_id = ? AND lp.permission_date = ?
      ORDER BY lp.created_at DESC LIMIT 1
    `, [employeeId, today]);
    return rows[0] || null;
  }

  static async markUsed(id) {
    const [result] = await db.execute(
      'UPDATE late_permissions SET used = 1 WHERE id = ?', [id]
    );
    return result.affectedRows > 0;
  }

  static async getTodayPermissions() {
    const now = new Date();
    const today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    const [rows] = await db.execute(`
      SELECT lp.*, e.name as employee_name, e.employee_uid,
             g.name as granted_by_name
      FROM late_permissions lp
      JOIN employees e ON lp.employee_id = e.id
      JOIN employees g ON lp.granted_by = g.id
      WHERE lp.permission_date = ?
      ORDER BY lp.created_at DESC
    `, [today]);
    return rows;
  }

  static async alreadyExists(employeeId, date) {
    const [rows] = await db.execute(
      'SELECT id FROM late_permissions WHERE employee_id = ? AND permission_date = ?',
      [employeeId, date]
    );
    return rows.length > 0;
  }
}

module.exports = LatePermission;
