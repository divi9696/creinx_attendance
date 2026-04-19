const db = require('../config/db');

class Employee {
  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM employees WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByEmployeeUid(uid) {
    const [rows] = await db.execute('SELECT * FROM employees WHERE employee_uid = ?', [uid]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM employees');
    return rows;
  }

  // Generate the next employee UID (e.g., CRX0001, CRX0002)
  static async generateNextUid() {
    const [rows] = await db.execute(
      `SELECT employee_uid FROM employees WHERE employee_uid LIKE 'CRX%' ORDER BY employee_uid DESC LIMIT 1`
    );
    if (rows.length === 0) return 'CRX0001';
    const last = rows[0].employee_uid; // e.g., 'CRX0007'
    const num = parseInt(last.replace('CRX', ''), 10);
    return 'CRX' + String(num + 1).padStart(4, '0');
  }

  static async create(employeeData) {
    const uid = await this.generateNextUid();
    const [result] = await db.execute(
      `INSERT INTO employees 
        (employee_uid, name, email, mobile, password, role, department, job_role, date_of_join, first_login, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      [
        uid,
        employeeData.name,
        employeeData.email,
        employeeData.mobile || null,
        employeeData.password,
        employeeData.role || 'employee',
        employeeData.department || null,
        employeeData.job_role || null,
        employeeData.date_of_join || null
      ]
    );
    return { insertId: result.insertId, uid };
  }

  static async update(id, employeeData) {
    const [result] = await db.execute(
      `UPDATE employees SET name = ?, email = ?, mobile = ?, role = ?, department = ?, job_role = ?, date_of_join = ? WHERE id = ?`,
      [
        employeeData.name,
        employeeData.email,
        employeeData.mobile || null,
        employeeData.role,
        employeeData.department || null,
        employeeData.job_role || null,
        employeeData.date_of_join || null,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async updatePassword(employeeId, newPassword) {
    const [result] = await db.execute(
      'UPDATE employees SET password = ?, first_login = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPassword, employeeId]
    );
    return result.affectedRows > 0;
  }

  // Activate account: set password, mark verified, clear first_login
  static async activateAccount(employeeId, hashedPassword) {
    const [result] = await db.execute(
      'UPDATE employees SET password = ?, is_verified = 1, first_login = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, employeeId]
    );
    return result.affectedRows > 0;
  }

  // Mark account as verified (without password change)
  static async markVerified(employeeId) {
    const [result] = await db.execute(
      'UPDATE employees SET is_verified = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [employeeId]
    );
    return result.affectedRows > 0;
  }

  // Bind employee to a specific device IP
  static async bindDeviceIp(employeeId, ip) {
    const [result] = await db.execute(
      'UPDATE employees SET device_ip = ? WHERE id = ?',
      [ip, employeeId]
    );
    return result.affectedRows > 0;
  }

  // Clear device IP binding (admin action — allows employee to re-bind from new device)
  static async clearDeviceIp(employeeId) {
    const [result] = await db.execute(
      'UPDATE employees SET device_ip = NULL WHERE id = ?',
      [employeeId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Employee;
