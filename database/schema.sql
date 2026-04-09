CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'employee') DEFAULT 'employee',
  department VARCHAR(100),
  office_lat DECIMAL(10, 8),
  office_lon DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE leave_requests (
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
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (reviewed_by) REFERENCES employees(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date)
);

CREATE TABLE attendance (
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
);

CREATE INDEX idx_employee_id ON attendance(employee_id);
CREATE INDEX idx_check_in ON attendance(check_in);
CREATE INDEX idx_attendance_type ON attendance(attendance_type);
