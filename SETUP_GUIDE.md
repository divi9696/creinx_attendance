# Creinx Attendance System - Setup & Run Guide

## Prerequisites
- ✅ Node.js v24.11.0 (Installed)
- ✅ npm v11.6.1 (Installed)
- ✅ MySQL 8.0.39 (Installed)

## Setup Steps

### 1. Database Setup

Open MySQL Command Prompt or MySQL Workbench and run:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS attendance;
USE attendance;

-- Create employees table
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

-- Create leave_requests table
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

-- Create attendance table
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
  FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id),
  INDEX idx_employee_id (employee_id),
  INDEX idx_check_in (check_in),
  INDEX idx_attendance_type (attendance_type)
);

-- Insert test users (password: bcrypt hashed - use the dashboard to create real users)
-- OR use this simple approach: hash these passwords using bcrypt online tool
-- For testing, you'll need to hash these passwords:
-- Admin password: admin123 → $2b$10$...
-- Employee password: emp123 → $2b$10$...

INSERT INTO employees (name, email, password, role, department) VALUES
('Admin User', 'admin@company.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'admin', 'Management'),
('John Doe', 'john@company.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'employee', 'IT'),
('Jane Smith', 'jane@company.com', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'employee', 'HR');
```

**Note:** For hashing passwords, use bcrypt. Install globally:
```bash
npm install -g bcryptjs

# Then in node:
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('admin123', 10)
> bcrypt.hashSync('emp123', 10)
```

### 2. Backend Setup

```bash
# Navigate to project root
cd c:\Users\Guru\Desktop\Creinx_Attendance

# Install dependencies (already done, but run if needed)
npm install

# Start backend server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup (In a new terminal)

```bash
# Navigate to frontend directory
cd c:\Users\Guru\Desktop\Creinx_Attendance\frontend

# Install dependencies (already done, but run if needed)
npm install

# Start frontend server (runs on port 3000)
npm start
```

## Running the Application

### Terminal 1 - Backend Server
```bash
cd c:\Users\Guru\Desktop\Creinx_Attendance
npm run dev
# Output should show: "Server running on port 5000"
```

### Terminal 2 - Frontend Server
```bash
cd c:\Users\Guru\Desktop\Creinx_Attendance\frontend
npm start
# Browser should automatically open at http://localhost:3000
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## Login Credentials (After Database Setup)

### Admin Login
- Email: admin@company.com
- Password: admin123

### Employee Login
- Email: john@company.com
- Password: emp123

Or create your own users through the system.

## Features to Test

### Employee Features
1. ✅ Login with email/password
2. ✅ Mark attendance (3 types: Office/Home/Leave)
3. ✅ Request leave (date range + reason)
4. ✅ View leave request status
5. ✅ View attendance history

### Admin Features
1. ✅ Login with admin credentials
2. ✅ View dashboard (stats + pending leaves)
3. ✅ Approve/Decline leave requests
4. ✅ View attendance analytics (Daily/Weekly/Monthly)
5. ✅ View employee attendance records

## Troubleshooting

### "Cannot connect to MySQL"
- Ensure MySQL server is running
- Verify DB credentials in `.env` file
- Check database exists: `SHOW DATABASES;`

### "Port 5000 already in use"
- Change port in `.env`: `PORT=5001`
- Or kill process: `npx kill-port 5000`

### "Module not found" errors
- Run `npm install` in the directory
- Delete `node_modules` and reinstall if needed

### Frontend not connecting to backend
- Ensure backend is running on port 5000
- Check Network tab in browser DevTools
- Verify API URL in components: `http://localhost:5000/api`

## File Structure
```
Creinx_Attendance/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── database/
│   └── schema.sql
├── .env
└── package.json
```

## Next Steps

1. ✅ Run `npm run dev` in backend directory
2. ✅ Run `npm start` in frontend directory
3. ✅ Open http://localhost:3000 in browser
4. ✅ Test login and features
5. ✅ Deploy to production when ready

## Support

For issues or questions, check:
- Backend logs (terminal running npm run dev)
- Browser console (F12 → Console tab)
- Network tab (F12 → Network tab) for API calls
