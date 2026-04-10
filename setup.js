const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const setupDatabase = async () => {
  let connection;
  try {
    // Connect directly to the database provided by Aiven
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'defaultdb',
      port: process.env.DB_PORT || 3306,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✓ Connected to MySQL Cloud');

    // Create/Update employees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'employee') DEFAULT 'employee',
        department VARCHAR(100),
        job_role VARCHAR(100),
        date_of_join DATE,
        first_login TINYINT(1) DEFAULT 1,
        office_lat DECIMAL(10, 8),
        office_lon DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure missing columns exist (for existing databases)
    try { await connection.query('ALTER TABLE employees ADD COLUMN job_role VARCHAR(100) AFTER department'); } catch (e) {}
    try { await connection.query('ALTER TABLE employees ADD COLUMN date_of_join DATE AFTER job_role'); } catch (e) {}
    try { await connection.query('ALTER TABLE employees ADD COLUMN first_login TINYINT(1) DEFAULT 1 AFTER date_of_join'); } catch (e) {}
    
    console.log('✓ Employees table updated with all missing columns');

    // Create leave_requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason VARCHAR(500) NOT NULL,
        status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
        decline_reason VARCHAR(500),
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewed_by) REFERENCES employees(id) ON DELETE SET NULL,
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date)
      )
    `);
    console.log('✓ Leave requests table created/verified');

    // Create attendance table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        check_in DATETIME NOT NULL,
        check_out DATETIME,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        ip_address VARCHAR(50),
        status ENUM('present', 'absent', 'late', 'leave') DEFAULT 'present',
        attendance_type ENUM('work_office', 'work_home', 'leave') DEFAULT 'work_office',
        leave_request_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE SET NULL,
        INDEX idx_employee_id (employee_id),
        INDEX idx_check_in (check_in),
        INDEX idx_attendance_type (attendance_type)
      )
    `);
    console.log('✓ Attendance table created/verified');

    // Check if users exist
    const [users] = await connection.query('SELECT COUNT(*) as count FROM employees');

    if (users[0].count === 0) {
      // Hash passwords
      const adminPass = await bcrypt.hash('admin123', 10);
      const empPass = await bcrypt.hash('emp123', 10);

      // Insert test users
      await connection.query(
        `INSERT INTO employees (name, email, password, role, department) VALUES
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)`,
        [
          'Admin User', 'admin@company.com', adminPass, 'admin', 'Management',
          'John Doe', 'john@company.com', empPass, 'employee', 'IT',
          'Jane Smith', 'jane@company.com', empPass, 'employee', 'HR'
        ]
      );
      console.log('✓ Test users created');
      console.log('\n📋 Test Credentials:');
      console.log('  Admin: admin@company.com / admin123');
      console.log('  Employee: john@company.com / emp123');
      console.log('  Employee: jane@company.com / emp123');
    } else {
      console.log('✓ Users already exist in database');
    }

    console.log('\n✅ Database setup complete!');
    console.log('\n🚀 Ready to start the application:');
    console.log('  Terminal 1: npm run dev (backend)');
    console.log('  Terminal 2: cd frontend && npm start (frontend)');
    console.log('\n📱 Access: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n⚠️  MySQL access denied. Check your .env credentials:');
      console.error('   DB_HOST:', process.env.DB_HOST);
      console.error('   DB_USER:', process.env.DB_USER);
      console.error('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '(empty)');
    }
  } finally {
    if (connection) await connection.end();
  }
};

setupDatabase();
