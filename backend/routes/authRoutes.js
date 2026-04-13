const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Login / Logout
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Change password (authenticated)
router.post('/change-password', authenticateToken, authController.changePassword);

// Account activation (new employee — OTP from email)
router.post('/activate', authController.activateAccount);
router.post('/resend-activation', authController.resendActivationOTP);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
