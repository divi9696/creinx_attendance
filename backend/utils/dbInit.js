const db = require('../config/db');

// Initialize database schema
const initializeDatabase = () => {
  try {
    // Create employees table
    db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'employee')) DEFAULT 'employee',
        department TEXT,
        job_role TEXT,
        date_of_join TEXT,
        first_login INTEGER DEFAULT 1,
        office_lat REAL,
        office_lon REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create leave_requests table
    db.exec(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'approved', 'declined')) DEFAULT 'pending',
        decline_reason TEXT,
        requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INTEGER,
        reviewed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (reviewed_by) REFERENCES employees(id)
      )
    `);

    // Create attendance table
    db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        check_in DATETIME NOT NULL,
        check_out DATETIME,
        latitude REAL,
        longitude REAL,
        ip_address TEXT,
        status TEXT CHECK(status IN ('present', 'absent', 'late', 'leave')) DEFAULT 'present',
        attendance_type TEXT CHECK(attendance_type IN ('work_office', 'work_home', 'leave')) DEFAULT 'work_office',
        leave_request_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id)
      )
    `);

    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_leave_employee_id ON leave_requests(employee_id);
      CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
      CREATE INDEX IF NOT EXISTS idx_leave_start_date ON leave_requests(start_date);
      CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in);
      CREATE INDEX IF NOT EXISTS idx_attendance_type ON attendance(attendance_type);
    `);

    // Add missing columns to employees table if they don't exist
    try {
      db.exec(`
        ALTER TABLE employees ADD COLUMN job_role TEXT;
      `);
    } catch (err) {
      // Column might already exist, ignore
    }

    try {
      db.exec(`
        ALTER TABLE employees ADD COLUMN date_of_join TEXT;
      `);
    } catch (err) {
      // Column might already exist, ignore
    }

    try {
      db.exec(`
        ALTER TABLE employees ADD COLUMN first_login INTEGER DEFAULT 1;
      `);
    } catch (err) {
      // Column might already exist, ignore
    }

    console.log('✓ Database tables created/verified');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
};

module.exports = { initializeDatabase };
