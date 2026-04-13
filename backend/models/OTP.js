const db = require('../config/db');

class OTP {
  // Generate a secure 6-digit OTP
  static generate() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  // Create and save OTP (invalidates previous OTPs of same type for same employee)
  static async create(employeeId, type) {
    const otp = this.generate();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate old OTPs of same type
    await db.query(
      `UPDATE otp_tokens SET is_used = 1 WHERE employee_id = ? AND type = ? AND is_used = 0`,
      [employeeId, type]
    );

    await db.query(
      `INSERT INTO otp_tokens (employee_id, otp_code, type, expires_at, is_used) VALUES (?, ?, ?, ?, 0)`,
      [employeeId, otp, type, expiresAt]
    );

    return otp;
  }

  // Verify OTP — returns { valid, error }
  static async verify(employeeId, type, otpCode) {
    const [rows] = await db.query(
      `SELECT * FROM otp_tokens 
       WHERE employee_id = ? AND type = ? AND otp_code = ? AND is_used = 0
       ORDER BY created_at DESC LIMIT 1`,
      [employeeId, type, otpCode]
    );

    if (rows.length === 0) {
      return { valid: false, error: 'Invalid OTP. Please try again.' };
    }

    const record = rows[0];
    if (new Date() > new Date(record.expires_at)) {
      await db.query(
        `UPDATE otp_tokens SET is_used = 1 WHERE id = ?`,
        [record.id]
      );
      return { valid: false, error: 'OTP has expired. Please request a new one.' };
    }

    // Mark as used
    await db.query(`UPDATE otp_tokens SET is_used = 1 WHERE id = ?`, [record.id]);

    return { valid: true };
  }

  // Cleanup expired/used tokens (optional maintenance)
  static async cleanup() {
    await db.query(
      `DELETE FROM otp_tokens WHERE is_used = 1 OR expires_at < NOW()`
    );
  }
}

module.exports = OTP;
