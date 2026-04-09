const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

exports.submitLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const employeeId = req.user.id;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Missing required fields: startDate, endDate, reason' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const overlapping = await LeaveRequest.getByDateRange(employeeId, startDate, endDate);
    if (overlapping.length > 0) {
      return res.status(409).json({ error: 'Leave request overlaps with existing approved leave' });
    }

    const leaveId = await LeaveRequest.create({
      employee_id: employeeId,
      start_date: startDate,
      end_date: endDate,
      reason
    });

    const leave = await LeaveRequest.findById(leaveId);
    res.status(201).json({ message: 'Leave request submitted', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEmployeeLeaves = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const leaves = await LeaveRequest.findByEmployeeId(employeeId);
    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    const leaves = await LeaveRequest.findPendingRequests(limit, offset);
    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const adminId = req.user.id;

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(409).json({ error: 'Leave request is already reviewed' });
    }

    const updated = await LeaveRequest.updateStatus(leaveId, 'approved', adminId);
    if (!updated) {
      return res.status(500).json({ error: 'Failed to approve leave' });
    }

    const updatedLeave = await LeaveRequest.findById(leaveId);
    res.json({ message: 'Leave approved', leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.declineLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { reason: declineReason } = req.body;
    const adminId = req.user.id;

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(409).json({ error: 'Leave request is already reviewed' });
    }

    const updated = await LeaveRequest.updateStatus(leaveId, 'declined', adminId, declineReason);
    if (!updated) {
      return res.status(500).json({ error: 'Failed to decline leave' });
    }

    const updatedLeave = await LeaveRequest.findById(leaveId);
    res.json({ message: 'Leave declined', leave: updatedLeave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLeaveAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const analytics = await LeaveRequest.getAnalytics(startDate, endDate);
    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

