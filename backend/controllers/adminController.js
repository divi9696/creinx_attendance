const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const LatePermission = require('../models/LatePermission');
const OTP = require('../models/OTP');
const emailService = require('../utils/emailService');
const bcrypt = require('bcryptjs');

exports.getDashboard = async (req, res) => {
  try {
    // Use Local Date string to match user behavior
    const now = new Date();
    const today = now.getFullYear() + '-' + 
                 String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(now.getDate()).padStart(2, '0');

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
    const { name, email, mobile, job_role, date_of_join, department, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!mobile) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    const existingEmployee = await Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({ error: 'Email already registered in the system' });
    }

    // Temporary placeholder password (employee sets it via OTP activation)
    const placeholderPassword = bcrypt.hashSync(Math.random().toString(36), 10);

    const employeeData = { name, email, mobile, job_role, date_of_join, department, password: placeholderPassword, role: role || 'employee' };
    const { insertId: employeeId, uid: employee_uid } = await Employee.create(employeeData);

    // Send Welcome Email with Employee ID
    let emailSent = false;
    try {
      await emailService.sendWelcomeIDEmail(email, name, employee_uid);
      emailSent = true;
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr.message);
    }

    const newEmployee = await Employee.findById(employeeId);
    const { password: _, ...employeeWithoutPassword } = newEmployee;

    res.status(201).json({
      message: emailSent
        ? `Employee created. Welcome email with Employee ID sent to ${email}.`
        : `Employee created (Employee ID: ${employee_uid}). Email could not be sent.`,
      employee: employeeWithoutPassword,
      employee_uid,
      emailSent
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, job_role, date_of_join, department, role } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employeeData = {
      name:        name        || employee.name,
      email:       email       || employee.email,
      mobile:      mobile      || employee.mobile,
      job_role:    job_role    || employee.job_role,
      date_of_join:date_of_join|| employee.date_of_join,
      department:  department  || employee.department,
      role:        role        || employee.role
    };

    await Employee.update(id, employeeData);
    const updatedEmployee = await Employee.findById(id);
    const { password: _, ...rest } = updatedEmployee;

    res.json({ message: 'Employee updated successfully', employee: rest });
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

    if (employee.employee_uid === 'CRX0001') {
      return res.status(403).json({ error: 'Primary Administrator (CRX0001) cannot be deleted.' });
    }

    const result = await Employee.delete(id);
    if (!result) {
        console.error(`Deleting employee ${id} failed in database`);
        return res.status(500).json({ error: 'Deletion failed in database' });
    }
    console.log(`Successfully deleted employee ${id}`);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.handleLeaveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, decline_reason } = req.body;
    const adminId = req.user.id;

    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });

    const targetEmployee = await Employee.findById(leave.employee_id);
    const actingAdmin = await Employee.findById(adminId);

    if (targetEmployee.role === 'admin' && actingAdmin.employee_uid !== 'CRX0001') {
      return res.status(403).json({ error: 'Only Primary Administrator (CRX0001) is authorized to review leave requests from other administrators.' });
    }

    await LeaveRequest.updateStatus(id, status, adminId, decline_reason);
    res.json({ message: `Leave request ${status} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmployeeFullReport = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const logs = await Attendance.getByEmployeeId(id, 1000);
    const leaves = await LeaveRequest.findByEmployeeId(id);

    res.json({
      employee,
      attendance: logs,
      leaves: leaves
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.grantLatePermission = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { employee_id, reason } = req.body;

    if (!employee_id) {
      return res.status(400).json({ error: 'employee_id is required' });
    }

    const employee = await Employee.findById(employee_id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const now = new Date();
    const today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    const exists = await LatePermission.alreadyExists(employee_id, today);
    if (exists) {
      return res.status(409).json({ error: 'Late permission already granted to this employee for today' });
    }

    await LatePermission.create({ employee_id, granted_by: adminId, permission_date: today, reason });
    res.json({ message: `Late attendance permission granted to ${employee.name} for today.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLatePermissions = async (req, res) => {
  try {
    const permissions = await LatePermission.getTodayPermissions();
    res.json({ permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
