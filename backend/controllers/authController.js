const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const OTP = require('../models/OTP');
const emailService = require('../utils/emailService');
const { validatePassword, checkRequirements } = require('../utils/passwordValidator');

// ─── LOGIN (by Employee UID) ───────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { employee_uid, password } = req.body;

    if (!employee_uid || !password) {
      return res.status(400).json({ error: 'Employee ID and password are required' });
    }

    const employee = await Employee.findByEmployeeUid(employee_uid.trim().toUpperCase());
    if (!employee) {
      return res.status(401).json({ error: 'Invalid Employee ID or password' });
    }

    // Check if account is activated
    if (!employee.is_verified) {
      return res.status(403).json({
        error: 'Account not activated. Check your email for the activation OTP.',
        code: 'NOT_VERIFIED',
        employee_uid: employee.employee_uid
      });
    }

    const passwordMatch = bcrypt.compareSync(password, employee.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid Employee ID or password' });
    }

    // IP Device Binding Logic Check
    if (employee.employee_uid !== 'CRX0001') {
      const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

      if (!employee.device_ip) {
        // First time logging in -> permanently bind this IP
        await Employee.bindDeviceIp(employee.id, clientIp);
      } else if (employee.device_ip !== clientIp) {
        // Trying to log in from a different IP/device
        return res.status(403).json({ error: 'Security Block: Unauthorized device detected. You can only log into your account from your specifically registered device.' });
      }
    }

    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role, employee_uid: employee.employee_uid },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: employee.id,
        employee_uid: employee.employee_uid,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        first_login: employee.first_login
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

// ─── CHANGE PASSWORD (authenticated) ──────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const employeeId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        errors: validation.errors,
        requirements: validation.requirements
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    const passwordMatch = bcrypt.compareSync(currentPassword, employee.password);
    if (!passwordMatch) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await Employee.updatePassword(employeeId, hashedPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── ACTIVATE ACCOUNT (new employee, OTP from email) ──────────────────────
exports.activateAccount = async (req, res) => {
  try {
    const { employee_uid, otp, newPassword, confirmPassword } = req.body;

    if (!employee_uid || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate password strength for new user
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        errors: validation.errors,
        requirements: validation.requirements
      });
    }

    const employee = await Employee.findByEmployeeUid(employee_uid.trim().toUpperCase());
    if (!employee) {
      return res.status(404).json({ error: 'Employee ID not found' });
    }
    if (employee.is_verified) {
      return res.status(400).json({ error: 'Account is already activated. Please login.' });
    }

    const result = await OTP.verify(employee.id, 'email_verify', otp.trim());
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await Employee.activateAccount(employee.id, hashedPassword);

    res.json({ message: 'Account activated successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── RESEND ACTIVATION OTP ────────────────────────────────────────────────
exports.resendActivationOTP = async (req, res) => {
  try {
    const { employee_uid } = req.body;
    if (!employee_uid) return res.status(400).json({ error: 'Employee ID is required' });

    const employee = await Employee.findByEmployeeUid(employee_uid.trim().toUpperCase());
    if (!employee) return res.status(404).json({ error: 'Employee ID not found' });
    if (employee.is_verified) return res.status(400).json({ error: 'Account is already activated.' });

    const otp = await OTP.create(employee.id, 'email_verify');

    // Try to send email (non-blocking for cases where email is not configured)
    try {
      await emailService.sendActivationOTP(employee.email, employee.name, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      return res.status(500).json({ error: 'Failed to send OTP email. Please check email configuration.' });
    }

    res.json({ message: `Activation OTP sent to ${employee.email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── FORGOT PASSWORD – REQUEST OTP ────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { employee_uid } = req.body;
    if (!employee_uid) return res.status(400).json({ error: 'Employee ID is required' });

    const employee = await Employee.findByEmployeeUid(employee_uid.trim().toUpperCase());
    if (!employee) {
      // Return generic message to prevent user enumeration
      return res.json({ message: 'If this Employee ID exists, a reset OTP has been sent.' });
    }
    if (!employee.is_verified) {
      return res.status(400).json({
        error: 'Account not activated yet. Please activate your account first.',
        code: 'NOT_VERIFIED'
      });
    }

    const otp = await OTP.create(employee.id, 'password_reset');

    try {
      await emailService.sendPasswordResetOTP(employee.email, employee.name, employee.employee_uid, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      return res.status(500).json({ error: 'Failed to send OTP email. Please contact your administrator.' });
    }

    res.json({ message: `Password reset OTP sent to ${employee.email.replace(/(.{2}).+(@.+)/, '$1***$2')}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── FORGOT PASSWORD – VERIFY OTP & RESET ────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { employee_uid, otp, newPassword, confirmPassword } = req.body;

    if (!employee_uid || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate password strength for password reset
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        errors: validation.errors,
        requirements: validation.requirements
      });
    }

    const employee = await Employee.findByEmployeeUid(employee_uid.trim().toUpperCase());
    if (!employee) return res.status(404).json({ error: 'Employee ID not found' });

    const result = await OTP.verify(employee.id, 'password_reset', otp.trim());
    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await Employee.updatePassword(employee.id, hashedPassword);

    res.json({ message: 'Password reset successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
