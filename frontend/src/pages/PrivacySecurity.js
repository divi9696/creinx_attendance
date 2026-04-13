import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, ToggleRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

const PrivacySecurity = ({ user }) => {
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    allowMessaging: true,
    dataCollection: true,
    twoFactorAuth: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/privacy-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrivacy(response.data.settings || privacy);
    } catch (error) {
      console.log('Using default privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacy = async (key, value) => {
    try {
      const updated = { ...privacy, [key]: value };
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5001/api/privacy-settings',
        updated,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrivacy(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to update privacy settings', error);
    }
  };

  return (
    <div className="settings-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-container"
      >
        {/* Header */}
        <div className="settings-header">
          <div className="header-icon">
            <Shield size={28} />
          </div>
          <div>
            <h1>Privacy & Security</h1>
            <p>Control your privacy settings and security options</p>
          </div>
        </div>

        {/* Save Notification */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="save-notification"
          >
            <CheckCircle size={20} />
            <span>Settings saved successfully</span>
          </motion.div>
        )}

        {loading ? (
          <div className="loading-spinner">Loading privacy settings...</div>
        ) : (
          <>
            {/* Privacy Settings */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-card">
              <div className="card-header">
                <h2>Privacy Settings</h2>
              </div>

              <div className="settings-list">
                <label className="setting-item">
                  <div className="setting-content">
                    <span className="setting-label">Profile Visibility</span>
                    <span className="setting-desc">
                      Allow other users to see your profile
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.profileVisible}
                      onChange={(e) => updatePrivacy('profileVisible', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>

                <label className="setting-item">
                  <div className="setting-content">
                    <span className="setting-label">Show Email Address</span>
                    <span className="setting-desc">
                      Display your email on your profile
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => updatePrivacy('showEmail', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>

                <label className="setting-item">
                  <div className="setting-content">
                    <span className="setting-label">Allow Messaging</span>
                    <span className="setting-desc">
                      Let other users send you messages
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.allowMessaging}
                      onChange={(e) => updatePrivacy('allowMessaging', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>

                <label className="setting-item">
                  <div className="setting-content">
                    <span className="setting-label">Data Collection</span>
                    <span className="setting-desc">
                      Allow system to collect usage analytics
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.dataCollection}
                      onChange={(e) => updatePrivacy('dataCollection', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Security Settings */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-card">
              <div className="card-header">
                <h2>Security Settings</h2>
              </div>

              <div className="settings-list">
                <label className="setting-item">
                  <div className="setting-content">
                    <span className="setting-label">Two-Factor Authentication</span>
                    <span className="setting-desc">
                      Add an extra layer of security to your account
                    </span>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={privacy.twoFactorAuth}
                      onChange={(e) => updatePrivacy('twoFactorAuth', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>
              </div>

              <div className="security-info">
                <h3>Security Tips</h3>
                <ul>
                  <li>Use a strong, unique password for your account</li>
                  <li>Enable two-factor authentication for added security</li>
                  <li>Regularly review your login activity</li>
                  <li>Never share your password with anyone</li>
                  <li>Log out from all devices if you suspect unauthorized access</li>
                </ul>
              </div>
            </motion.div>

            {/* Data & Privacy */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-card">
              <div className="card-header">
                <h2>Data & Privacy</h2>
              </div>

              <div className="data-section">
                <div className="data-item">
                  <h3>Your Data</h3>
                  <p>
                    We collect minimal personal information necessary for the operation of the
                    Creinx Attendance System. Your data is encrypted and stored securely.
                  </p>
                </div>

                <div className="data-item">
                  <h3>Data Retention</h3>
                  <p>
                    Attendance records and related data are retained according to company policy and
                    applicable regulations. You can request data deletion at any time.
                  </p>
                </div>

                <div className="data-item">
                  <h3>Third-Party Sharing</h3>
                  <p>
                    Your data is not shared with third parties without your explicit consent. We
                    only share data with authorized personnel on a need-to-know basis.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      <style jsx>{`
        .settings-page {
          padding: 0;
          min-height: 100vh;
        }

        .settings-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 30px;
        }

        .settings-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: rgba(78, 205, 196, 0.1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4deaff;
          flex-shrink: 0;
        }

        .settings-header h1 {
          font-size: 2rem;
          color: white;
          margin: 0 0 8px;
        }

        .settings-header p {
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .save-notification {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 24px;
          color: #22c55e;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .settings-card {
          background: rgba(10, 12, 20, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          backdrop-filter: blur(20px);
        }

        .card-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-header h2 {
          font-size: 1.2rem;
          color: white;
          margin: 0;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .setting-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .setting-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .setting-label {
          color: white;
          font-weight: 600;
        }

        .setting-desc {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
        }

        .toggle-switch {
          position: relative;
          width: 50px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 2px;
          transition: all 0.3s;
        }

        .toggle-switch input {
          display: none;
        }

        .toggle-switch input:checked + .toggle-slider {
          background: #4deaff;
          box-shadow: 0 0 15px rgba(77, 234, 255, 0.4);
          transform: translateX(22px);
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transition: all 0.3s;
          cursor: pointer;
        }

        .security-info {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .security-info h3 {
          color: white;
          margin: 0 0 12px;
          font-size: 1rem;
        }

        .security-info ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .security-info li {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .security-info li::before {
          content: '✓';
          color: #22c55e;
          font-weight: bold;
        }

        .data-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .data-item h3 {
          color: white;
          margin: 0 0 8px;
          font-size: 1rem;
        }

        .data-item p {
          color: rgba(255, 255, 255, 0.4);
          margin: 0;
          line-height: 1.6;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .settings-container {
            padding: 20px 16px;
          }

          .settings-header {
            flex-direction: column;
            text-align: center;
          }

          .header-icon {
            margin: 0 auto;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .toggle-switch {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacySecurity;
