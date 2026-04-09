const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const bcrypt = require('bcrypt');

exports.getDashboard = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayStats = Attendance.getTodayCount(today);
    const pendingLeaves = LeaveRequest.findPendingRequests(10, 0);
    const employees = Employee.findAll();

    res.json({
      stats: {
        totalEmployees: employees.length,
        presentToday: todayStats.total || 0,
        officeToday: todayStats.office || 0,
        homeToday: todayStats.home || 0,
        leaveToday: todayStats.leaves || 0
      },
      pendingLeaves,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmployees = (req, res) => {
  try {
    const employees = Employee.findAll();
    const employeesWithoutPassword = employees.map(emp => {
      const { password, ...rest } = emp;
      return rest;
    });
    res.json({ employees: employeesWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceReport = (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const attendance = Attendance.getReport(startDate, endDate);
    res.json({ attendance, count: attendance.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceAnalytics = (req, res) => {
  try {
    const { startDate, endDate, view = 'daily' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    let analytics;
    if (view === 'weekly') {
      analytics = Attendance.getWeeklyAnalytics(startDate, endDate);
    } else if (view === 'monthly') {
      analytics = Attendance.getMonthlyAnalytics(startDate, endDate);
    } else {
      analytics = Attendance.getDailyAnalytics(startDate, endDate);
    }

    res.json({ analytics, view });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmployeeAttendance = (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const employee = Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let attendance;
    if (startDate && endDate) {
      attendance = Attendance.getReport(startDate, endDate);
      attendance = attendance.filter(a => a.employee_id === parseInt(employeeId));
    } else {
      attendance = Attendance.getByEmployeeId(employeeId);
    }

    res.json({ employee, attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEmployee = (req, res) => {
  try {
    const { name, email, job_role, date_of_join, department } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email already exists
    const existingEmployee = Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Use default password for all new employees
    const defaultPassword = 'creinx123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

    // Create employee
    const employeeData = {
      name,
      email,
      password: hashedPassword,
      job_role,
      date_of_join,
      department,
      role: 'employee'
    };

    const employeeId = Employee.create(employeeData);
    const newEmployee = Employee.findById(employeeId);
    const { password: _, ...employeeWithoutPassword } = newEmployee;

    res.status(201).json({
      message: 'Employee created successfully. Default password is: creinx123',
      employee: employeeWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
