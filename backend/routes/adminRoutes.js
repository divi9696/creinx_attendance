const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticateToken, authorizeRole(['admin']), adminController.getDashboard);
router.get('/employees', authenticateToken, authorizeRole(['admin']), adminController.getEmployees);
router.post('/employees', authenticateToken, authorizeRole(['admin']), adminController.createEmployee);
router.get('/report', authenticateToken, authorizeRole(['admin']), adminController.getAttendanceReport);
router.get('/analytics', authenticateToken, authorizeRole(['admin']), adminController.getAttendanceAnalytics);
router.get('/employee/:employeeId', authenticateToken, authorizeRole(['admin']), adminController.getEmployeeAttendance);

module.exports = router;
