const db = require('./config/db');
const bcrypt = require('bcryptjs');
const { initializeDatabase } = require('./utils/dbInit');

const setupDatabase = async () => {
  try {
    // Initialize tables
    await initializeDatabase();

    // Check if users exist
    const [rows] = await db.query('SELECT COUNT(*) as count FROM employees');
    const result = rows[0];

    if (result.count === 0) {
      // Hash passwords
      const adminPass = bcrypt.hashSync('admin123', 10);
      const empPass = bcrypt.hashSync('emp123', 10);

      // Insert test users
      await db.query(`
        INSERT INTO employees (name, email, password, role, department)
        VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
      `, [
        'Admin User', 'admin@company.com', adminPass, 'admin', 'Management',
        'John Doe', 'john@company.com', empPass, 'employee', 'IT',
        'Jane Smith', 'jane@company.com', empPass, 'employee', 'HR'
      ]);

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

