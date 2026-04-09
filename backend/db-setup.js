const db = require('./config/db');
const bcrypt = require('bcrypt');
const { initializeDatabase } = require('./utils/dbInit');

const setupDatabase = () => {
  try {
    // Initialize tables
    initializeDatabase();

    // Check if users exist
    const stmt = db.prepare('SELECT COUNT(*) as count FROM employees');
    const result = stmt.get();

    if (result.count === 0) {
      // Hash passwords
      const adminPass = bcrypt.hashSync('admin123', 10);
      const empPass = bcrypt.hashSync('emp123', 10);

      // Insert test users
      const insertStmt = db.prepare(`
        INSERT INTO employees (name, email, password, role, department)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertStmt.run('Admin User', 'admin@company.com', adminPass, 'admin', 'Management');
      insertStmt.run('John Doe', 'john@company.com', empPass, 'employee', 'IT');
      insertStmt.run('Jane Smith', 'jane@company.com', empPass, 'employee', 'HR');

      console.log('✅ Test users created:');
      console.log('   Admin: admin@company.com / admin123');
      console.log('   Employee: john@company.com / emp123');
      console.log('   Employee: jane@company.com / emp123');
    } else {
      console.log('✅ Database already initialized with users');
    }
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  }
};

module.exports = setupDatabase;
