const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Employee routes
router.post('/submit', authenticateToken, leaveController.submitLeaveRequest);
router.get('/', authenticateToken, leaveController.getEmployeeLeaves);

// Admin routes
router.get('/admin/pending', authenticateToken, authorizeRole(['admin']), leaveController.getPendingRequests);
router.post('/admin/:leaveId/approve', authenticateToken, authorizeRole(['admin']), leaveController.approveLeave);
router.post('/admin/:leaveId/decline', authenticateToken, authorizeRole(['admin']), leaveController.declineLeave);
router.get('/admin/analytics', authenticateToken, authorizeRole(['admin']), leaveController.getLeaveAnalytics);

module.exports = router;
