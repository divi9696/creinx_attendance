const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/attendance', authenticateToken, employeeController.markAttendance);
router.get('/history', authenticateToken, employeeController.getAttendanceHistory);
router.get('/history/:type', authenticateToken, employeeController.getAttendanceByType);
router.get('/profile', authenticateToken, employeeController.getProfile);

module.exports = router;
