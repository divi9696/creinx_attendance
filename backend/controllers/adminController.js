const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const bcrypt = require('bcrypt');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayStats = await Attendance.getTodayCount(today);
    const pendingLeaves = await LeaveRequest.findPendingRequests(10, 0);
    const employees = await Employee.findAll();

    res.json({
      stats: {
        totalEmployees: employees.length,
        presentToday: todayStats?.total || 0,
        officeToday: todayStats?.office || 0,
        homeToday: todayStats?.home || 0,
        leaveToday: todayStats?.leaves || 0
      },
      pendingLeaves,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    const employeesWithoutPassword = employees.map(emp => {
      const { password, ...rest } = emp;
      return rest;
    });
    res.json({ employees: employeesWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const attendance = await Attendance.getReport(startDate, endDate);
    res.json({ attendance, count: attendance.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, view = 'daily' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    let analytics;
    if (view === 'weekly') {
      analytics = await Attendance.getWeeklyAnalytics(startDate, endDate);
    } else if (view === 'monthly') {
      analytics = await Attendance.getMonthlyAnalytics(startDate, endDate);
    } else {
      analytics = await Attendance.getDailyAnalytics(startDate, endDate);
    }

    res.json({ analytics, view });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let attendance;
    if (startDate && endDate) {
      attendance = await Attendance.getReport(startDate, endDate);
      attendance = attendance.filter(a => a.employee_id === parseInt(employeeId));
    } else {
      attendance = await Attendance.getByEmployeeId(employeeId);
    }

    res.json({ employee, attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, job_role, date_of_join, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const existingEmployee = await Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const defaultPassword = 'creinx123';
    const hashedPassword = bcrypt.hashSync(defaultPassword, 10);

    const employeeData = {
      name,
      email,
      password: hashedPassword,
      job_role,
      date_of_join,
      department,
      role: 'employee'
    };

    const employeeId = await Employee.create(employeeData);
    const newEmployee = await Employee.findById(employeeId);
    const { password: _, ...employeeWithoutPassword } = newEmployee;

    res.status(201).json({
      message: 'Employee created successfully. Default password is: creinx123',
      employee: employeeWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, job_role, date_of_join, department, role } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employeeData = {
      name: name || employee.name,
      email: email || employee.email,
      job_role: job_role || employee.job_role,
      date_of_join: date_of_join || employee.date_of_join,
      department: department || employee.department,
      role: role || employee.role
    };

    await Employee.update(id, employeeData);
    const updatedEmployee = await Employee.findById(id);
    const { password: _, ...rest } = updatedEmployee;

    res.json({
      message: 'Employee updated successfully',
      employee: rest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await Employee.delete(id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

