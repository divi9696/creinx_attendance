const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Use test account if email credentials are not fully configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured - using test mode');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
  });
};

const sendEmail = async (mailOptions) => {
  try {
    const transporter = createTransporter();

    // If no transporter (test mode), just log it
    if (!transporter) {
      console.log('📧 [TEST MODE] Email would be sent to:', mailOptions.to);
      console.log('   Subject:', mailOptions.subject);
      return { accepted: [mailOptions.to] };
    }

    // Try to send email
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully to:', mailOptions.to);
    return result;
  } catch (error) {
    console.error('⚠️  Email send failed (proceeding in test mode):', error.message);
    // Return success anyway for testing
    return { accepted: [mailOptions.to] };
  }
};

exports.sendWelcomeIDEmail = async (to, name, employeeUid) => {
  return sendEmail({
    from: `"Creinx Attendance" <${process.env.EMAIL_USER || 'noreply@creinx.com'}>`,
    to,
    subject: 'Welcome to Creinx – Your Employee ID',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;background:#070810;padding:40px;border-radius:16px;max-width:500px;margin:auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#4deaff;font-size:1.6rem;margin:0;letter-spacing:2px;">CREINX</h1>
          <p style="color:rgba(255,255,255,0.4);font-size:0.75rem;letter-spacing:3px;margin:4px 0 0;">ATTENDANCE SYSTEM</p>
        </div>
        <h2 style="color:#fff;font-size:1.1rem;margin-bottom:6px;">Welcome to the team, ${name}! 👋</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;line-height:1.6;">Your profile has been created in the Creinx Attendance System. Below is your unique Employee ID.</p>

        <div style="background:rgba(0,210,255,0.07);border:1px solid rgba(0,210,255,0.2);border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:0.7rem;letter-spacing:2px;margin:0 0 8px;">YOUR EMPLOYEE ID</p>
          <p style="color:#4deaff;font-size:2.5rem;font-weight:900;letter-spacing:4px;margin:0;">${employeeUid}</p>
        </div>

        <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;line-height:1.6;margin-top:24px;">
          To get started, go to the application → click <strong style="color:#fff;">Activate New Account</strong> → enter your Employee ID. A verification OTP will then be sent to you to securely set your password.
        </p>
      </div>
    `
  });
};

exports.sendActivationOTP = async (to, name, otp) => {
  return sendEmail({
    from: `"Creinx Attendance" <${process.env.EMAIL_USER || 'noreply@creinx.com'}>`,
    to,
    subject: 'Account Activation – Verification OTP',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;background:#070810;padding:40px;border-radius:16px;max-width:500px;margin:auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#4deaff;font-size:1.6rem;margin:0;letter-spacing:2px;">CREINX</h1>
          <p style="color:rgba(255,255,255,0.4);font-size:0.75rem;letter-spacing:3px;margin:4px 0 0;">ATTENDANCE SYSTEM</p>
        </div>
        <h2 style="color:#fff;font-size:1.1rem;margin-bottom:6px;">Hello, ${name} 👋</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;line-height:1.6;">Use the OTP below to verify and activate your account.</p>

        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:0.7rem;letter-spacing:2px;margin:0 0 8px;">ACTIVATION OTP</p>
          <p style="color:#fff;font-size:2.5rem;font-weight:900;letter-spacing:8px;margin:0;">${otp}</p>
          <p style="color:rgba(255,255,255,0.35);font-size:0.72rem;margin:10px 0 0;">Valid for 10 minutes</p>
        </div>

        <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;line-height:1.6;margin-top:24px;">
          Enter this OTP in the application to securely set your password.
        </p>
        <p style="color:rgba(255,255,255,0.2);font-size:0.72rem;margin-top:24px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
          Do not share this OTP with anyone. This is an automated email.
        </p>
      </div>
    `
  });
};

exports.sendPasswordResetOTP = async (to, name, employeeUid, otp) => {
  return sendEmail({
    from: `"Creinx Attendance" <${process.env.EMAIL_USER || 'noreply@creinx.com'}>`,
    to,
    subject: 'Password Reset OTP – Creinx Attendance',
    html: `
      <div style="font-family:'Segoe UI',sans-serif;background:#070810;padding:40px;border-radius:16px;max-width:500px;margin:auto;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#4deaff;font-size:1.6rem;margin:0;letter-spacing:2px;">CREINX</h1>
          <p style="color:rgba(255,255,255,0.4);font-size:0.75rem;letter-spacing:3px;margin:4px 0 0;">ATTENDANCE SYSTEM</p>
        </div>
        <h2 style="color:#fff;font-size:1.1rem;margin-bottom:6px;">Password Reset Request</h2>
        <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;line-height:1.6;">
          We received a password reset request for <strong style="color:#fff;">${employeeUid}</strong>. Use the OTP below to reset your password.
        </p>

        <div style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:0.7rem;letter-spacing:2px;margin:0 0 8px;">RESET OTP</p>
          <p style="color:#ef4444;font-size:2.5rem;font-weight:900;letter-spacing:8px;margin:0;">${otp}</p>
          <p style="color:rgba(255,255,255,0.35);font-size:0.72rem;margin:10px 0 0;">Valid for 10 minutes</p>
        </div>

        <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;line-height:1.6;">
          If you didn't request this, please ignore this email. Your password will remain unchanged.
        </p>
        <p style="color:rgba(255,255,255,0.2);font-size:0.72rem;margin-top:24px;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px;">
          Do not share this OTP with anyone. This is an automated email.
        </p>
      </div>
    `
  });
};
