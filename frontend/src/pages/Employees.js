import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, UserCheck, Edit3, Trash2, X, Briefcase, Mail, Building, Calendar as CalendarIcon, Shield } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', job_role: '', date_of_join: '', department: '', role: 'employee'
  });
  const [editingId, setEditingId] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees);
      setError('');
    } catch (err) {
      setError('Sector Failure: Could not synchronize personnel data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `${API_URL}/admin/employee/${editingId}`
        : `${API_URL}/admin/employees`;
      const method = editingId ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmitSuccess(editingId ? 'Identity Updated' : 'Personnel Initialized');
      setFormData({ name: '', email: '', job_role: '', date_of_join: '', department: '', role: 'employee' });
      setShowForm(false);
      setEditingId(null);
      fetchEmployees();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError('System Error: Transaction blocked.');
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      name: employee.name,
      email: employee.email,
      job_role: employee.job_role || '',
      date_of_join: employee.date_of_join ? employee.date_of_join.split('T')[0] : '',
      department: employee.department || '',
      role: employee.role
    });
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('PERMANENTLY DECOMMISSION THIS IDENTITY?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitSuccess('Identity Decommissioned');
      fetchEmployees();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError('System Error: Removal blocked.');
    }
  };

  if (loading) return (
    <div className="hq-loading">
      <div className="hq-spinner"></div>
      <span>Synchronizing Workforce...</span>
    </div>
  );

  return (
    <div className="workforce-universe">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="hq-glass-header"
      >
        <div className="header-info">
          <h1 className="brand-fonts">Workforce Matrix</h1>
          <p className="hq-sub">PERSONNEL MANAGEMENT & DEPLOYMENT</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(!showForm); if (showForm) setEditingId(null); }} 
          className="elite-action-btn"
        >
          {showForm ? <X size={18} /> : <UserPlus size={18} />}
          <span>{showForm ? 'Abort' : 'Initialize Personnel'}</span>
        </motion.button>
      </motion.header>

      <div className="toast-sector">
        <AnimatePresence>
          {submitSuccess && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="toast-glass success">
               <UserCheck size={16} /> {submitSuccess}
            </motion.div>
          )}
          {error && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="toast-glass error">
               <Shield size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="form-reveal-layer"
          >
            <div className="layer-card personnel-form-box">
              <h3>{editingId ? 'Modify Access Profile' : 'New Identity Entry'}</h3>
              <form onSubmit={handleSubmit} className="matrix-form">
                <div className="form-grid-elite">
                   <div className="f-field"><Mail size={16} /><input type="email" placeholder="Work Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                   <div className="f-field"><Shield size={16} /><input type="text" placeholder="Full Identity" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                   <div className="f-field"><Briefcase size={16} /><input type="text" placeholder="Personnel Designation" value={formData.job_role} onChange={e => setFormData({...formData, job_role: e.target.value})} /></div>
                   <div className="f-field"><Building size={16} /><input type="text" placeholder="Functional Group" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} /></div>
                   <div className="f-field"><CalendarIcon size={16} /><input type="date" value={formData.date_of_join} onChange={e => setFormData({...formData, date_of_join: e.target.value})} /></div>
                   <div className="f-field">
                     <Shield size={16} />
                     <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="employee">Standard Personnel</option>
                        <option value="admin">Matrix Admin</option>
                     </select>
                   </div>
                </div>
                <button type="submit" className="matrix-submit-btn">{editingId ? 'COMMIT CHANGES' : 'AUTHORIZE PERSONNEL'}</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="layer-card matrix-grid-box">
        <div className="matrix-scroll">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>PERSONNEL IDENTITY</th>
                <th>DESIGNATION & SECTOR</th>
                <th>ENTRY DATE</th>
                <th style={{ textAlign: 'right' }}>OPERATIONS</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <motion.tr 
                  key={emp.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="matrix-row"
                >
                  <td>
                    <div className="p-cell">
                      <div className="p-avatar-pod">{emp.name[0]}</div>
                      <div className="p-main-info">
                        <span className="p-name">{emp.name}</span>
                        <span className="p-meta">{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="p-sector">
                      <span className="p-role-tag">{emp.job_role || 'General Staff'}</span>
                      <span className="p-dept-tag">{emp.department || 'Main Ops'}</span>
                    </div>
                  </td>
                  <td><span className="p-date-tag">{emp.date_of_join ? new Date(emp.date_of_join).toLocaleDateString() : 'N/A'}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="p-ops-group">
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(emp)} className="p-op-btn e"><Edit3 size={14} /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(emp.id)} className="p-op-btn d"><Trash2 size={14} /></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .workforce-universe { padding: 40px 0; max-width: 1400px; margin: 0 auto; min-height: 100vh; position: relative; }
        
        .hq-glass-header { 
          display: flex; justify-content: space-between; align-items: center; 
          background: rgba(13, 15, 22, 0.4); backdrop-filter: blur(20px); 
          padding: 30px 40px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 30px;
        }

        .hq-sub { font-size: 0.65rem; color: var(--primary-glow); letter-spacing: 4px; font-weight: 900; margin-top: 5px; }

        .elite-action-btn { 
          display: flex; align-items: center; gap: 12px; background: var(--primary-glow);
          color: #000; border: none; padding: 12px 24px; border-radius: 14px;
          font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: 0.3s;
        }

        .form-reveal-layer { overflow: hidden; margin-bottom: 30px; }
        .personnel-form-box { padding: 40px; }
        .personnel-form-box h3 { font-size: 1rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px; }

        .form-grid-elite { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .f-field { position: relative; display: flex; align-items: center; }
        .f-field :global(svg) { position: absolute; left: 15px; opacity: 0.5; color: var(--primary-glow); }
        .f-field input, .f-field select { width: 100%; height: 50px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: 0 45px; border-radius: 12px; color: #fff; font-family: 'Outfit'; transition: 0.3s; }
        .f-field input:focus { border-color: var(--primary-glow); background: rgba(0,0,0,0.5); outline: none; }

        .matrix-submit-btn { width: 100%; height: 55px; background: linear-gradient(135deg, #0056ff, #00d2ff); border: none; border-radius: 14px; color: #fff; font-weight: 900; letter-spacing: 2px; cursor: pointer; transition: 0.3s; }

        .matrix-grid-box { padding: 0; overflow: hidden; }
        .matrix-table { width: 100%; border-collapse: collapse; }
        th { padding: 25px 30px; text-align: left; font-size: 0.65rem; color: var(--text-muted); letter-spacing: 2px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 800; }
        .matrix-row { border-bottom: 1px solid rgba(255,255,255,0.03); transition: 0.3s; }
        .matrix-row:hover { background: rgba(255,255,255,0.02); }
        .matrix-row td { padding: 20px 30px; }

        .p-cell { display: flex; align-items: center; gap: 15px; }
        .p-avatar-pod { width: 44px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid var(--primary-glow); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: var(--primary-glow); box-shadow: 0 0 15px rgba(0,210,255,0.1); }
        .p-name { display: block; font-weight: 700; font-size: 0.95rem; }
        .p-meta { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }

        .p-sector { display: flex; flex-direction: column; gap: 4px; }
        .p-role-tag { font-size: 0.85rem; font-weight: 700; color: #fff; }
        .p-dept-tag { font-size: 0.6rem; text-transform: uppercase; color: var(--primary-glow); font-weight: 900; letter-spacing: 1px; }

        .p-date-tag { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }

        .p-ops-group { display: flex; gap: 10px; justify-content: flex-end; }
        .p-op-btn { width: 34px; height: 34px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; color: var(--text-muted); cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .p-op-btn.e:hover { color: var(--primary-glow); border-color: var(--primary-glow); }
        .p-op-btn.d:hover { color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }

        .toast-sector { position: fixed; top: 120px; right: 40px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; }
        .toast-glass { padding: 15px 25px; border-radius: 14px; backdrop-filter: blur(10px); font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 12px; border: 1px solid transparent; }
        .toast-glass.success { background: rgba(34,197,94,0.1); color: #22c55e; border-color: rgba(34,197,94,0.2); }
        .toast-glass.error { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }

        .hq-loading { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; font-weight: 700; color: var(--primary-glow); }
        .hq-spinner { width: 30px; height: 30px; border: 2px solid rgba(0, 210, 255, 0.1); border-top-color: var(--primary-glow); border-radius: 50%; animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 1100px) { .form-grid-elite { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
};

export default Employees;
