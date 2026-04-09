# 🚀 Creinx Attendance System - Quick Start Guide

## ✅ IMPLEMENTATION COMPLETE!

Your complete Creinx Attendance System is ready to run. All features have been implemented including:
- ✅ Separate Admin & Employee Logins
- ✅ Leave Request System (Submit → Approve/Decline)
- ✅ 3 Attendance Types (Office/Home/Leave)
- ✅ 100m Geofencing for Office Attendance
- ✅ Admin Analytics (Daily/Weekly/Monthly views)
- ✅ SQLite Database (No MySQL needed!)

---

## 🎯 GETTING STARTED

### Option 1: Windows (Easiest)
1. **Double-click** `start.bat` in the project folder
2. This will:
   - Open Backend Server (port 5001)
   - Open Frontend Server (port 3000)
   - Auto-initialize SQLite database
   - Create test users

> The browser should open automatically to http://localhost:3000

### Option 2: Manual Terminal Commands

**Terminal 1 - Backend:**
```bash
cd c:\Users\Guru\Desktop\Creinx_Attendance
npm run dev
```

Wait for: `🚀 Backend running on http://localhost:5001`

**Terminal 2 - Frontend:**
```bash
cd c:\Users\Guru\Desktop\Creinx_Attendance\frontend
npm start
```

Wait for: `webpack compiled...` and browser opens at http://localhost:3000

---

## 🔐 DEFAULT TEST CREDENTIALS

### Admin Account
- **Email:** `admin@company.com`
- **Password:** `admin123`
- **Access:** Full dashboard, analytics, leave approval

### Employee Accounts
- **Email:** `john@company.com` or `jane@company.com`
- **Password:** `emp123`
- **Access:** Mark attendance, request leave, view status

---

## 🎨 FEATURES TO TEST

### 1. ADMIN LOGIN & DASHBOARD
✅ Login with admin@company.com / admin123
✅ See dashboard stats (Total Employees, Office/Home/Leave today)
✅ View pending leave requests widget
✅ Approve or Decline leave requests
✅ Check attendance analytics for Daily/Weekly/Monthly views

### 2. EMPLOYEE LOGIN & FEATURES
✅ Login with john@company.com / emp123
✅ Mark Attendance with 3 types:
   - 🏢 Work from Office (needs location within 100m)
   - 🏠 Work from Home (no location required)
   - 📅 Leave (requires approved leave request)
✅ Submit leave request with date range & reason
✅ View leave request status (Pending/Approved/Declined)
✅ See attendance history

### 3. LEAVE WORKFLOW
✅ Employee submits leave → Status shows "Pending"
✅ Admin sees request in dashboard widget
✅ Admin clicks "Approve" → Status updates to "Approved"
✅ Employee can now mark attendance as "Leave" for that date

---

## 📂 PROJECT STRUCTURE

```
Creinx_Attendance/
├── backend/
│   ├── config/db.js (SQLite connection)
│   ├── controllers/ (Login, Admin, Employee, Leave)
│   ├── models/ (Employee, Attendance, LeaveRequest)
│   ├── routes/ (Auth, Admin, Employee, Leave)
│   ├── utils/ (Geolocation, Attendance Validation)
│   ├── db-setup.js (Initialize database + test users)
│   ├── app.js (Express app)
│   └── server.js (Start server)
│
├── frontend/
│   ├── src/
│   │   ├── pages/ (Login, AdminDashboard, EmployeeDashboard)
│   │   ├── components/ (Forms, Widgets, Selectors)
│   │   ├── styles/App.css (All styling)
│   │   └── App.js (Router & Main app)
│   └── public/index.html
│
├── attendance.db (SQLite database - auto-created on first run)
├── start.bat (Windows startup script)
├── start.sh (Linux/Mac startup script)
└── README.md
```

---

## 🔧 TECH STACK

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + React Router v6 + Axios |
| **Backend** | Node.js + Express.js |
| **Database** | SQLite 3 (No MySQL needed!) |
| **Auth** | JWT + bcrypt |
| **Location** | Browser Geolocation API + Haversine formula |

---

## 🌐 API ENDPOINTS

### Authentication
- `POST /api/auth/login` - Login (returns JWT token)

### Employee APIs
- `POST /api/employee/attendance` - Mark attendance with type
- `GET /api/employee/history` - Get attendance history
- `GET /api/employee/profile` - Get employee profile
- `POST /api/leaves/submit` - Submit leave request
- `GET /api/leaves` - Get my leave requests

### Admin APIs
- `GET /api/admin/dashboard` - Dashboard stats + pending leaves
- `GET /api/admin/analytics` - Attendance analytics (daily/weekly/monthly)
- `GET /api/admin/employees` - All employees
- `GET /api/leaves/admin/pending` - Pending leave requests
- `POST /api/leaves/admin/:id/approve` - Approve leave
- `POST /api/leaves/admin/:id/decline` - Decline leave

---

## ⚙️ CONFIGURATION

Edit `.env` to customize:
```env
PORT=5001                          # Backend port
OFFICE_LATITUDE=40.7128            # Office GPS coords
OFFICE_LONGITUDE=-74.0060
GEOFENCE_RADIUS=0.1                # 100 meters
JWT_SECRET=your_secret_key         # Change this!
```

---

## 📊 DATABASE

SQLite database is **automatically created** on first run with:
- ✅ Employees table (with test users)
- ✅ Attendance table (with type tracking)
- ✅ Leave requests table (with approval workflow)

File: `attendance.db` (in project root)

---

## 🚨 TROUBLESHOOTING

### Port 5001 already in use?
```bash
npx kill-port 5001
npm run dev
```

### Port 3000 already in use?
Update `.env`:
```env
PORT=5002  # or any available port
```

### Database locked?
Delete `attendance.db` and restart - it will recreate automatically

### Geolocation not working?
- Ensure you allow browser location access
- Geofencing validates within 100m of office (40.7128, -74.0060)
- Edit in `.env` to change office location

### Can't login?
Test credentials:
- Admin: `admin@company.com` / `admin123`
- Employee: `john@company.com` / `emp123`

---

## 📝 NEXT STEPS

### Optional Enhancements:
1. Add email notifications for leave approvals
2. Add leave type options (Sick, Casual, Personal, etc.)
3. Add half-day leave support
4. Add employee export/reports feature
5. Add mobile-responsive improvements

---

## 🎓 TESTING CHECKLIST

- [ ] Login as admin → See dashboard
- [ ] Login as employee → See mark attendance
- [ ] Employee submits leave → Status shows pending
- [ ] Admin approves leave → Status changes to approved
- [ ] Employee marks Office attendance → Geofence validation works
- [ ] Employee marks Home attendance → No validation needed
- [ ] View analytics daily/weekly/monthly → Data displays correctly
- [ ] Logout & login again → Session persists

---

## 📞 SUPPORT

For issues:
1. Check browser console (F12 → Console tab)
2. Check terminal output for backend errors
3. Check database isn't locked
4. Verify ports 5001 & 3000 are available

---

## ✨ YOU'RE READY TO GO!

Run `start.bat` and enjoy your Creinx Attendance System! 🎉

Questions? Everything is documented in the code comments.
