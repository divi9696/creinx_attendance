const db = require('../config/db');

// Initialize database schema
const initializeDatabase = async () => {
  try {
    // Create employees table (base structure)
    await db.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_uid VARCHAR(20) UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        mobile VARCHAR(15),
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'employee') DEFAULT 'employee',
        department VARCHAR(100),
        job_role VARCHAR(100),
        date_of_join DATE,
        first_login TINYINT(1) DEFAULT 1,
        is_verified TINYINT(1) DEFAULT 0,
        office_lat DECIMAL(10, 8),
        office_lon DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to existing tables (safe — ignored if already exist)
    const alterColumns = [
      `ALTER TABLE employees ADD COLUMN employee_uid VARCHAR(20) UNIQUE`,
      `ALTER TABLE employees ADD COLUMN mobile VARCHAR(15)`,
      `ALTER TABLE employees ADD COLUMN is_verified TINYINT(1) DEFAULT 0`,
    ];
    for (const sql of alterColumns) {
      try { await db.query(sql); } catch (e) { /* column already exists */ }
    }

    // Create otp_tokens table
    await db.query(`
      CREATE TABLE IF NOT EXISTS otp_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        type ENUM('email_verify', 'password_reset') NOT NULL,
        expires_at DATETIME NOT NULL,
        is_used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Create leave_requests table
    await db.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'declined') DEFAULT 'pending',
        decline_reason TEXT,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (reviewed_by) REFERENCES employees(id)
      )
    `);

    // Create attendance table
    await db.query(`
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
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id)
      )
    `);

    // Create announcements table
    await db.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        message LONGTEXT NOT NULL,
        created_by INT NOT NULL,
        status ENUM('active', 'deleted') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Create late_permissions table (admin grants late check-in access)
    await db.query(`
      CREATE TABLE IF NOT EXISTS late_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        granted_by INT NOT NULL,
        permission_date DATE NOT NULL,
        reason VARCHAR(255),
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Indexes (safe — ignored if exist)
    try { await db.query('CREATE INDEX idx_leave_status ON leave_requests(status)'); } catch (e) {}
    try { await db.query('CREATE INDEX idx_attendance_check_in ON attendance(check_in)'); } catch (e) {}
    try { await db.query('CREATE INDEX idx_otp_employee ON otp_tokens(employee_id, type)'); } catch (e) {}
    try { await db.query('CREATE INDEX idx_late_perm_date ON late_permissions(employee_id, permission_date)'); } catch (e) {}

    console.log('✓ Database tables created/verified');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
};

module.exports = { initializeDatabase };
