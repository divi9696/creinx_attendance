const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticateToken, authorizeRole(['admin']), adminController.getDashboard);
router.get('/employees', authenticateToken, authorizeRole(['admin']), adminController.getEmployees);
router.post('/employees', authenticateToken, authorizeRole(['admin']), adminController.createEmployee);
router.put('/employee/:id', authenticateToken, authorizeRole(['admin']), adminController.updateEmployee);
router.delete('/employee/:id', authenticateToken, authorizeRole(['admin']), adminController.deleteEmployee);
router.get('/report', authenticateToken, authorizeRole(['admin']), adminController.getAttendanceReport);
router.get('/analytics', authenticateToken, authorizeRole(['admin']), adminController.getAttendanceAnalytics);
router.get('/employee/:employeeId', authenticateToken, authorizeRole(['admin']), adminController.getEmployeeAttendance);
router.get('/employee/:id/full-report', authenticateToken, authorizeRole(['admin']), adminController.getEmployeeFullReport);
router.post('/leave/:id/review', authenticateToken, authorizeRole(['admin']), adminController.handleLeaveReview);
router.post('/late-permission', authenticateToken, authorizeRole(['admin']), adminController.grantLatePermission);
router.post('/grant-leave', authenticateToken, authorizeRole(['admin']), adminController.grantLeave);
router.get('/late-permissions', authenticateToken, authorizeRole(['admin']), adminController.getLatePermissions);
router.delete('/employee/:id/device-ip', authenticateToken, authorizeRole(['admin']), adminController.resetDeviceIp);

module.exports = router;
