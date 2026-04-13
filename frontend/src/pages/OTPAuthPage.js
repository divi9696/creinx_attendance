import React, { useState, useRef } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IdCard, KeyRound, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, Send, RefreshCcw, Check, X } from 'lucide-react';

// Password validation function
const validatePassword = (password) => {
  const requirements = {
    minLength: password && password.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    numbers: /[0-9]/.test(password || ''),
    symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password || '')
  };

  const allMet = Object.values(requirements).every(v => v === true);
  return { requirements, allMet };
};

// Used for both /forgot-password and /activate
const OTPAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActivation = location.pathname === '/activate';

  const [step, setStep] = useState(1);
  const [employeeUid, setEmployeeUid] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [done, setDone] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({ requirements: {}, allMet: false });
  const [serverErrors, setServerErrors] = useState([]);

  const otpRefs = useRef([]);

  const otp = otpDigits.join('');

  // Update password validation as user types
  React.useEffect(() => {
    if (newPassword) {
      setPasswordValidation(validatePassword(newPassword));
    } else {
      setPasswordValidation({ requirements: {}, allMet: false });
    }
  }, [newPassword]);

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const digits = [...otpDigits];
    digits[idx] = val.slice(-1);
    setOtpDigits(digits);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // Step 1 → Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      const uid = employeeUid.trim().toUpperCase();
      const endpoint = isActivation
        ? `${API_URL}/auth/resend-activation`
        : `${API_URL}/auth/forgot-password`;
      const res = await axios.post(endpoint, { employee_uid: uid });
      setInfo(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Verify OTP (just advance to step 3)
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setStep(3);
  };

  // Step 3 → Set password (calls activate or reset-password)
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setServerErrors([]);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const validation = validatePassword(newPassword);
    if (!validation.allMet) {
      setError('Password does not meet all security requirements');
      return;
    }

    setLoading(true); setError('');
    try {
      const uid = employeeUid.trim().toUpperCase();
      const endpoint = isActivation
        ? `${API_URL}/auth/activate`
        : `${API_URL}/auth/reset-password`;
      await axios.post(endpoint, {
        employee_uid: uid,
        otp,
        newPassword,
        confirmPassword
      });
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || 'Failed. Please try again.';

      // Handle server validation errors
      if (data?.errors && Array.isArray(data.errors)) {
        setServerErrors(data.errors);
      }

      // If OTP error, go back to OTP step
      if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        setStep(2);
        setOtpDigits(['', '', '', '', '', '']);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Employee ID', 'Verify OTP', 'Set Password'];

  if (done) {
    return (
      <div className="otp-universe">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="otp-card done-card"
        >
          <div className="done-icon"><CheckCircle size={48} color="#22c55e" /></div>
          <h2>{isActivation ? 'Account Activated!' : 'Password Reset!'}</h2>
          <p>{isActivation ? 'Your account is ready. You can now log in with your Employee ID.' : 'Your password has been reset successfully.'}</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="otp-submit-btn" onClick={() => navigate('/login')}>
            Go to Login
          </motion.button>
        </motion.div>
        <OTPStyles />
      </div>
    );
  }

  return (
    <div className="otp-universe">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="otp-card">
        {/* Header */}
        <div className="otp-header">
          <button className="otp-back-btn" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/login')}>
            <ArrowLeft size={16} />
          </button>
          <div className="otp-brand">
            <img src="/logo.png" alt="Creinx" style={{ width: 32, height: 'auto' }} />
            <div>
              <div className="otp-brand-name">CREINX</div>
              <div className="otp-brand-sub">{isActivation ? 'ACCOUNT ACTIVATION' : 'PASSWORD RESET'}</div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="otp-steps">
          {stepLabels.map((label, i) => (
            <div key={i} className={`otp-step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="step-label">{label}</span>
              {i < 2 && <div className={`step-line ${step > i + 1 ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Employee UID ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="otp-desc">
                {isActivation
                  ? 'Enter your Employee ID (sent in your welcome email). We\'ll send an activation OTP.'
                  : 'Enter your Employee ID to receive a password reset OTP on your registered email.'}
              </p>
              <form onSubmit={handleSendOTP}>
                <div className="otp-field">
                  <IdCard size={16} className="otp-field-icon" />
                  <input
                    type="text"
                    placeholder="e.g. CRX0001"
                    value={employeeUid}
                    onChange={e => setEmployeeUid(e.target.value.toUpperCase())}
                    required
                    style={{ textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 800 }}
                  />
                </div>
                {error && <div className="otp-error">{error}</div>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="otp-submit-btn" disabled={loading}>
                  {loading ? <span className="otp-loader" /> : <><Send size={15} /> Send OTP</>}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: OTP Input ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="otp-desc">
                {info || 'Enter the 6-digit OTP sent to your registered email.'}
              </p>
              <div className="otp-uid-badge">{employeeUid}</div>
              <form onSubmit={handleVerifyOTP}>
                <div className="otp-digits">
                  {otpDigits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`otp-digit-input ${d ? 'filled' : ''}`}
                    />
                  ))}
                </div>
                {error && <div className="otp-error">{error}</div>}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="otp-submit-btn" disabled={otp.length < 6}>
                  <KeyRound size={15} /> Verify OTP
                </motion.button>
                <button type="button" className="otp-resend-btn" onClick={() => { setStep(1); setOtpDigits(['','','','','','']); setError(''); }}>
                  <RefreshCcw size={13} /> Resend OTP
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 3: Set Password ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="otp-desc">
                {isActivation ? 'Create a strong password meeting all security requirements.' : 'Enter your new password meeting all security requirements.'}
              </p>
              <form onSubmit={handleSetPassword}>
                <div className="otp-field">
                  <Lock size={16} className="otp-field-icon" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="otp-eye-btn" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="otp-field" style={{ marginTop: 10 }}>
                  <Lock size={16} className="otp-field-icon" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Password Requirements Checklist */}
                {newPassword && (
                  <div className="pwd-requirements">
                    <div className="req-title">Password Requirements</div>
                    <div className="req-checklist">
                      <div className={`req-item ${passwordValidation.requirements.minLength ? 'met' : ''}`}>
                        <span className="req-icon">{passwordValidation.requirements.minLength ? <Check size={14} /> : <X size={14} />}</span>
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`req-item ${passwordValidation.requirements.uppercase ? 'met' : ''}`}>
                        <span className="req-icon">{passwordValidation.requirements.uppercase ? <Check size={14} /> : <X size={14} />}</span>
                        <span>One uppercase letter (A-Z)</span>
                      </div>
                      <div className={`req-item ${passwordValidation.requirements.lowercase ? 'met' : ''}`}>
                        <span className="req-icon">{passwordValidation.requirements.lowercase ? <Check size={14} /> : <X size={14} />}</span>
                        <span>One lowercase letter (a-z)</span>
                      </div>
                      <div className={`req-item ${passwordValidation.requirements.numbers ? 'met' : ''}`}>
                        <span className="req-icon">{passwordValidation.requirements.numbers ? <Check size={14} /> : <X size={14} />}</span>
                        <span>One number (0-9)</span>
                      </div>
                      <div className={`req-item ${passwordValidation.requirements.symbols ? 'met' : ''}`}>
                        <span className="req-icon">{passwordValidation.requirements.symbols ? <Check size={14} /> : <X size={14} />}</span>
                        <span>One special character (!@#$%^&*)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Server validation errors */}
                {serverErrors.length > 0 && (
                  <div className="server-errors">
                    {serverErrors.map((err, idx) => (
                      <div key={idx} className="otp-error">{err}</div>
                    ))}
                  </div>
                )}

                {error && <div className="otp-error">{error}</div>}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="otp-submit-btn"
                  disabled={loading || !passwordValidation.allMet || newPassword !== confirmPassword}
                >
                  {loading ? <span className="otp-loader" /> : <><CheckCircle size={15} /> {isActivation ? 'Activate Account' : 'Reset Password'}</>}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <OTPStyles />
    </div>
  );
};

const OTPStyles = () => (
  <style>{`
    .otp-universe {
      min-height: 100vh; width: 100vw;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(ellipse at 30% 20%, rgba(0,86,255,0.08), transparent 60%),
                  radial-gradient(ellipse at 80% 80%, rgba(0,210,255,0.06), transparent 60%), #070810;
      font-family: 'Outfit', sans-serif;
    }
    .otp-card {
      width: min(480px, 92vw);
      background: rgba(10,12,20,0.95);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 32px 28px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
      max-height: 90vh;
      overflow-y: auto;
    }
    .done-card { text-align: center; }
    .done-icon { margin-bottom: 20px; }
    .done-card h2 { color: #fff; font-size: 1.4rem; font-weight: 900; margin: 0 0 10px; }
    .done-card p { color: rgba(255,255,255,0.45); font-size: 0.85rem; line-height: 1.6; margin: 0 0 24px; }

    .otp-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .otp-back-btn {
      width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s;
    }
    .otp-back-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .otp-brand { display: flex; align-items: center; gap: 10px; }
    .otp-brand-name { font-size: 0.9rem; font-weight: 900; color: #fff; letter-spacing: 2px; }
    .otp-brand-sub { font-size: 0.52rem; font-weight: 800; color: #4deaff; letter-spacing: 2px; margin-top: 2px; }

    .otp-steps {
      display: flex; align-items: center; justify-content: center;
      gap: 0; margin-bottom: 28px;
    }
    .otp-step { display: flex; align-items: center; }
    .step-circle {
      width: 28px; height: 28px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 900;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.3);
      transition: all 0.3s; flex-shrink: 0;
    }
    .otp-step.active .step-circle { background: rgba(0,210,255,0.15); border-color: #4deaff; color: #4deaff; }
    .otp-step.done .step-circle { background: rgba(34,197,94,0.15); border-color: #22c55e; color: #22c55e; }
    .step-label { font-size: 0.6rem; font-weight: 700; color: rgba(255,255,255,0.25); margin: 0 4px; white-space: nowrap; }
    .otp-step.active .step-label { color: #4deaff; }
    .otp-step.done .step-label { color: #22c55e; }
    .step-line { width: 32px; height: 1px; background: rgba(255,255,255,0.08); margin: 0 2px; flex-shrink: 0; }
    .step-line.done { background: #22c55e; }

    .otp-desc { color: rgba(255,255,255,0.45); font-size: 0.82rem; line-height: 1.6; margin-bottom: 20px; }
    .otp-uid-badge {
      display: inline-block; background: rgba(0,210,255,0.08);
      border: 1px solid rgba(0,210,255,0.2);
      color: #4deaff; font-size: 1rem; font-weight: 900; letter-spacing: 4px;
      padding: 8px 20px; border-radius: 10px; margin-bottom: 20px;
    }

    .otp-field {
      position: relative; display: flex; align-items: center;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; overflow: hidden; transition: border-color 0.2s; margin-bottom: 14px;
    }
    .otp-field:focus-within { border-color: #4deaff; }
    .otp-field-icon { position: absolute; left: 14px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
    .otp-field input {
      width: 100%; height: 48px; background: transparent; border: none;
      padding: 0 14px 0 42px; color: #fff; font-size: 0.875rem; font-family: 'Outfit', sans-serif;
    }
    .otp-field input:focus { outline: none; }
    .otp-field input::placeholder { color: rgba(255,255,255,0.2); }
    .otp-eye-btn {
      position: absolute; right: 12px; background: none; border: none;
      color: rgba(255,255,255,0.35); cursor: pointer; padding: 4px; display: flex; align-items: center;
    }

    .otp-digits { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    .otp-digit-input {
      width: 48px; height: 56px; border-radius: 12px; text-align: center;
      background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
      color: #fff; font-size: 1.4rem; font-weight: 900; font-family: 'Outfit', sans-serif;
      transition: all 0.2s;
    }
    .otp-digit-input:focus { outline: none; border-color: #4deaff; background: rgba(0,210,255,0.05); }
    .otp-digit-input.filled { border-color: rgba(0,210,255,0.3); }

    .pwd-requirements {
      background: rgba(0,210,255,0.05);
      border: 1px solid rgba(0,210,255,0.1);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 14px;
    }
    .req-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #4deaff;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .req-checklist { display: flex; flex-direction: column; gap: 8px; }
    .req-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.4);
      transition: color 0.2s;
    }
    .req-item.met {
      color: #22c55e;
    }
    .req-icon {
      display: flex; align-items: center; justify-content: center;
      width: 16px; height: 16px; flex-shrink: 0;
      color: currentColor;
    }

    .server-errors { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }

    .otp-submit-btn {
      width: 100%; height: 50px;
      background: linear-gradient(135deg, #0056ff, #4deaff);
      border: none; border-radius: 14px; color: #000;
      font-size: 0.88rem; font-weight: 900; letter-spacing: 1px;
      cursor: pointer; transition: all 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      font-family: 'Outfit', sans-serif; margin-top: 4px;
    }
    .otp-submit-btn:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(0,210,255,0.3); transform: translateY(-1px); }
    .otp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

    .otp-resend-btn {
      width: 100%; background: transparent; border: none;
      color: rgba(255,255,255,0.3); font-size: 0.75rem; font-weight: 600;
      cursor: pointer; margin-top: 12px; display: flex; align-items: center; justify-content: center; gap: 5px;
      font-family: 'Outfit', sans-serif; transition: color 0.2s;
    }
    .otp-resend-btn:hover { color: #4deaff; }

    .otp-error {
      background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2);
      color: #ef4444; font-size: 0.78rem; font-weight: 600;
      padding: 10px 14px; border-radius: 10px; margin-bottom: 14px;
    }

    .otp-loader {
      width: 18px; height: 18px; border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `}</style>
);

export default OTPAuthPage;
