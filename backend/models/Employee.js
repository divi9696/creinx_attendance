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

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM employees');
    return rows;
  }

  static async create(employeeData) {
    const [result] = await db.execute(
      'INSERT INTO employees (name, email, password, role, department, job_role, date_of_join, first_login) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [
        employeeData.name,
        employeeData.email,
        employeeData.password,
        employeeData.role || 'employee',
        employeeData.department,
        employeeData.job_role,
        employeeData.date_of_join
      ]
    );
    return result.insertId;
  }

  static async update(id, employeeData) {
    const [result] = await db.execute(
      'UPDATE employees SET name = ?, email = ?, role = ?, department = ?, job_role = ?, date_of_join = ? WHERE id = ?',
      [
        employeeData.name,
        employeeData.email,
        employeeData.role,
        employeeData.department,
        employeeData.job_role,
        employeeData.date_of_join,
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
}

module.exports = Employee;


