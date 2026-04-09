const db = require('../config/db');

class Employee {
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    return stmt.get(id);
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM employees WHERE email = ?');
    return stmt.get(email);
  }

  static findAll() {
    const stmt = db.prepare('SELECT * FROM employees');
    return stmt.all();
  }

  static create(employeeData) {
    const stmt = db.prepare(
      'INSERT INTO employees (name, email, password, role, department, job_role, date_of_join, first_login) VALUES (?, ?, ?, ?, ?, ?, ?, 1)'
    );
    const result = stmt.run(
      employeeData.name,
      employeeData.email,
      employeeData.password,
      employeeData.role || 'employee',
      employeeData.department,
      employeeData.job_role,
      employeeData.date_of_join
    );
    return result.lastInsertRowid;
  }

  static updatePassword(employeeId, newPassword) {
    const stmt = db.prepare(
      'UPDATE employees SET password = ?, first_login = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    return stmt.run(newPassword, employeeId);
  }
}

module.exports = Employee;

