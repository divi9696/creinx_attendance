# 🚀 Creinx Attendance System - Quick Start Guide

## ⚡ Fastest Way to Get Started

### Option 1: Automatic Setup (Recommended)
Simply double-click this file in Windows Explorer:
```
c:\Users\Guru\Desktop\Creinx_Attendance\run-all.bat
```

**This will automatically:**
1. ✅ Setup the database
2. ✅ Start backend server (port 5000)
3. ✅ Start frontend server (port 3000)
4. ✅ Open 2 new command windows

Then open your browser to: **http://localhost:3000**

---

### Option 2: Manual Step-by-Step

#### Step 1: Update .env with MySQL Password
1. Open `.env` file
2. Find: `DB_PASSWORD=`
3. Add your MySQL root password: `DB_PASSWORD=your_password`
4. Save the file

#### Step 2: Setup Database
Double-click:
```
setup-db.bat
```

Expected output:
```
✓ Connected to MySQL
✓ Database created/verified
✓ Employees table created/verified
✓ Leave requests table created/verified
✓ Attendance table created/verified
✓ Test users created

📋 Test Credentials:
  Admin: admin@company.com / admin123
  Employee: john@company.com / emp123
```

#### Step 3: Start Backend Server
In first Command Prompt window, double-click:
```
start-backend.bat
```

Expected output:
```
Server running on port 5000
```

#### Step 4: Start Frontend Server
In second Command Prompt window, double-click:
```
start-frontend.bat
```

Expected output:
```
Compiled successfully!
You can now view creinx-attendance-frontend in the browser.
```

#### Step 5: Access Application
Open your browser:
```
http://localhost:3000
```

---

## 🔐 Login Credentials

### Admin Account
- **Email**: admin@company.com
- **Password**: admin123

### Employee Accounts
- **Email**: john@company.com
- **Password**: emp123

- **Email**: jane@company.com
- **Password**: emp123

---

## 📋 What Each Startup File Does

| File | Purpose | Command Equivalent |
|------|---------|-------------------|
| `run-all.bat` | Complete automated setup | Runs setup + starts both servers |
| `setup-db.bat` | Database setup only | `node setup.js` |
| `start-backend.bat` | Backend server only | `node backend/server.js` |
| `start-frontend.bat` | Frontend server only | `npm start` (in frontend dir) |

---

## 🎯 Features to Test

### Employee Dashboard
- ✅ Mark Attendance (3 types: Office/Home/Leave)
- ✅ Request Leave (with date range & reason)
- ✅ View Leave Status (Pending/Approved/Declined)
- ✅ View Attendance History

### Admin Dashboard
- ✅ View Dashboard Stats (total employees, present today, by type)
- ✅ See Pending Leave Requests (widget)
- ✅ Approve/Decline Leaves (inline)
- ✅ View Analytics (Daily/Weekly/Monthly)
- ✅ View Attendance Records

---

## 🔧 Troubleshooting

### "Access denied for user 'root'@'localhost'"
**Solution**: Update `.env` with correct MySQL password
```
DB_PASSWORD=your_actual_mysql_password
```

### "Port 5000/3000 already in use"
**Solution**: Close other applications using these ports or update PORT in `.env`

### "Cannot find module 'xxx'"
**Solution**: Run in the Creinx_Attendance directory:
```
npm install
cd frontend && npm install
```

### "Browser won't connect to http://localhost:3000"
**Solution**:
1. Wait 3-5 seconds for frontend to compile
2. Check that npm start completed (look for "Compiled successfully!")
3. Close browser tab and refresh

### "Login doesn't work"
**Solution**:
1. Check backend server is running (port 5000)
2. Check .env has JWT_SECRET set
3. Try the test credentials above
4. Check browser console (F12) for errors

---

## 🏗️ Project Structure

```
Creinx_Attendance/
├── backend/
│   ├── config/         (Database config)
│   ├── controllers/    (API logic)
│   ├── models/        (Database models)
│   ├── routes/        (API routes)
│   ├── utils/         (Helper functions)
│   ├── app.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/ (UI components)
│   │   ├── pages/     (Page components)
│   │   ├── styles/    (CSS)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── database/
│   ├── schema.sql     (Database schema)
│   └── seed.sql       (Sample data)
├── .env               (Configuration)
├── setup.js           (Auto-setup script)
├── start-backend.bat
├── start-frontend.bat
├── setup-db.bat
└── run-all.bat
```

---

## 📚 API Documentation

### Login
```
POST /api/auth/login
Body: { email, password }
Returns: { token, user: { id, email, name, role } }
```

### Mark Attendance
```
POST /api/employee/attendance
Headers: { Authorization: Bearer <token> }
Body: { type: 'work_office'|'work_home'|'leave', latitude, longitude, leaveRequestId }
```

### Submit Leave Request
```
POST /api/leaves/submit
Headers: { Authorization: Bearer <token> }
Body: { startDate, endDate, reason }
```

### Admin: Get Pending Leaves
```
GET /api/leaves/admin/pending
Headers: { Authorization: Bearer <token> }
```

### Admin: Dashboard
```
GET /api/admin/dashboard
Headers: { Authorization: Bearer <token> }
Returns: { stats: {...}, pendingLeaves: [...] }
```

---

## 🌐 Browser Access

- **Frontend**: http://localhost:3000
- **Backend Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api

---

## 📞 Support

If something doesn't work:

1. **Check the terminal output** - Look for error messages
2. **Verify MySQL is running** - Open MySQL Workbench or Command Line
3. **Verify .env is correct** - Check DB credentials match your MySQL setup
4. **Check ports are free** - Ports 3000 and 5000 should be available
5. **Clear browser cache** - Ctrl+Shift+Delete or Cmd+Shift+Delete

---

## ✨ System Requirements

- ✅ Node.js v14+ (Tested on v24.11.0)
- ✅ npm v6+ (Tested on v11.6.1)
- ✅ MySQL 5.7+ (Tested on v8.0.39)
- ✅ Modern browser (Chrome, Firefox, Safari, Edge)

---

**Ready to go! Double-click `run-all.bat` and enjoy! 🎉**
