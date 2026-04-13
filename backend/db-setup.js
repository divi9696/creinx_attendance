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
      const empPass   = bcrypt.hashSync('emp123', 10);

      // Insert seed users with employee_uid and is_verified=1
      await db.query(`
        INSERT INTO employees (employee_uid, name, email, mobile, password, role, department, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'CRX0001', 'Admin User',  'admin@company.com', '9000000001', adminPass, 'admin',    'Management', 1,
        'CRX0002', 'John Doe',    'john@company.com',  '9000000002', empPass,   'employee', 'IT',         1,
        'CRX0003', 'Jane Smith',  'jane@company.com',  '9000000003', empPass,   'employee', 'HR',         1,
      ]);

      console.log('✅ Test users created:');
      console.log('   Admin:    CRX0001 / admin123');
      console.log('   Employee: CRX0002 / emp123 (John Doe)');
      console.log('   Employee: CRX0003 / emp123 (Jane Smith)');
    } else {
      // Backfill employee_uid for existing employees that don't have one
      const [existing] = await db.query(`SELECT id FROM employees WHERE employee_uid IS NULL ORDER BY id ASC`);
      for (let i = 0; i < existing.length; i++) {
        const uid = 'CRX' + String(i + 1).padStart(4, '0');
        await db.query(
          `UPDATE employees SET employee_uid = ?, is_verified = 1 WHERE id = ? AND employee_uid IS NULL`,
          [uid, existing[i].id]
        ).catch(() => {}); // skip if uid collision
      }
      console.log('✅ Database already initialized with users');
    }
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  }
};

module.exports = setupDatabase;
