-- Insert admin user
INSERT INTO employees (name, email, password, role, department)
VALUES ('Admin User', 'admin@company.com', 'hashed_password', 'admin', 'Management');

-- Insert sample employees
INSERT INTO employees (name, email, password, role, department)
VALUES
  ('John Doe', 'john@company.com', 'hashed_password', 'employee', 'IT'),
  ('Jane Smith', 'jane@company.com', 'hashed_password', 'employee', 'HR'),
  ('Bob Johnson', 'bob@company.com', 'hashed_password', 'employee', 'Finance');

-- Insert sample attendance records
INSERT INTO attendance (employee_id, check_in, latitude, longitude, status)
VALUES
  (2, NOW(), 40.7128, -74.0060, 'present'),
  (3, NOW(), 40.7128, -74.0060, 'present'),
  (4, NOW(), 40.7128, -74.0060, 'present');
