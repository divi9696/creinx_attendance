import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Edit3, Trash2, X, Briefcase,
  Mail, Building, Calendar, Shield, Search,
  CheckCircle, AlertTriangle
} from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', job_role: '', date_of_join: '', department: '', role: 'employee'
  });
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });

  useEffect(() => { fetchEmployees(); }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setFiltered(employees); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(employees.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q) ||
      e.job_role?.toLowerCase().includes(q)
    ));
  }, [searchQuery, employees]);

  const token = () => localStorage.getItem('token');

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 3000);
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/employees`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setEmployees(res.data.employees || []);
      setError('');
    } catch { setError('Failed to load workforce data.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_URL}/admin/employee/${editingId}` : `${API_URL}/admin/employees`;
      const method = editingId ? 'put' : 'post';
      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token()}` } });
      showToast('success', editingId ? 'Profile updated successfully.' : 'New employee initialized.');
      resetForm();
      fetchEmployees();
    } catch { showToast('error', 'Operation failed. Please try again.'); }
  };

  const handleEdit = (emp) => {
    setFormData({
      name: emp.name, email: emp.email, job_role: emp.job_role || '',
      date_of_join: emp.date_of_join ? emp.date_of_join.split('T')[0] : '',
      department: emp.department || '', role: emp.role
    });
    setEditingId(emp.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from the workforce matrix?`)) return;
    try {
      await axios.delete(`${API_URL}/admin/employee/${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      showToast('success', `${name} decommissioned.`);
      fetchEmployees();
    } catch { showToast('error', 'Deletion failed.'); }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', job_role: '', date_of_join: '', department: '', role: 'employee' });
    setEditingId(null);
    setShowForm(false);
  };

  const formField = (icon, placeholder, key, type = 'text', required = false) => (
    <div className="ff">
      {icon}
      <input
        type={type} placeholder={placeholder}
        value={formData[key]} required={required}
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
      />
    </div>
  );

  if (loading) return (
    <div className="emp-loading">
      <div className="emp-spinner"></div><span>Loading Workforce...</span>
    </div>
  );

  return (
    <div className="emp-page">

      {/* ─── Toast ─── */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
            className={`emp-toast ${toast.type}`}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="emp-header">
        <div>
          <h1 className="emp-title">Workforce Matrix</h1>
          <p className="emp-sub">{employees.length} personnel registered in system</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { if (showForm && !editingId) { resetForm(); } else { setShowForm(true); setEditingId(null); setFormData({ name: '', email: '', job_role: '', date_of_join: '', department: '', role: 'employee' }); } }}
          className={`emp-add-btn ${showForm && !editingId ? 'cancel' : ''}`}
        >
          {showForm && !editingId ? <><X size={18} /> Cancel</> : <><UserPlus size={18} /> Add Personnel</>}
        </motion.button>
      </motion.div>

      {/* ─── Add / Edit Form ─── */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="emp-form-card">
              <h3>{editingId ? '✏️ Modify Access Profile' : '➕ Initialize New Personnel'}</h3>
              <form onSubmit={handleSubmit} className="emp-form">
                <div className="emp-form-grid">
                  {formField(<Shield size={16} />, 'Full Name *', 'name', 'text', true)}
                  {formField(<Mail size={16} />, 'Work Email *', 'email', 'email', true)}
                  {formField(<Briefcase size={16} />, 'Job Designation', 'job_role')}
                  {formField(<Building size={16} />, 'Department / Sector', 'department')}
                  {formField(<Calendar size={16} />, 'Date of Joining', 'date_of_join', 'date')}
                  <div className="ff">
                    <Shield size={16} />
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      <option value="employee">Standard Employee</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
                <div className="emp-form-actions">
                  <button type="button" onClick={resetForm} className="emp-cancel-btn">Cancel</button>
                  <button type="submit" className="emp-save-btn">
                    {editingId ? 'Save Changes' : 'Initialize Personnel'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Search ─── */}
      <div className="emp-search-row">
        <div className="emp-search-box">
          <Search size={16} className="search-ico" />
          <input
            placeholder="Search by name, email, department, or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="search-clear"><X size={14} /></button>
          )}
        </div>
        <span className="emp-count-badge">{filtered.length} of {employees.length}</span>
      </div>

      {/* ─── Table Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="emp-table-card"
      >
        {error && <div className="emp-error"><AlertTriangle size={16} /> {error}</div>}

        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>IDENTITY</th>
                <th>DESIGNATION</th>
                <th>SECTOR</th>
                <th>JOINED</th>
                <th>ROLE</th>
                <th style={{ textAlign: 'right' }}>OPERATIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="emp-empty">
                      {searchQuery ? `No results for "${searchQuery}"` : 'No personnel registered yet.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((emp, idx) => (
                  <motion.tr
                    key={emp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="emp-row"
                  >
                    <td>
                      <div className="emp-identity">
                        <div className="emp-av">{emp.name[0]}</div>
                        <div>
                          <span className="emp-name">{emp.name}</span>
                          <span className="emp-email">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="emp-designation">{emp.job_role || '—'}</span></td>
                    <td>
                      <span className="emp-dept-pill">{emp.department || 'Main Ops'}</span>
                    </td>
                    <td>
                      <span className="emp-date">
                        {emp.date_of_join ? new Date(emp.date_of_join).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`emp-role-badge ${emp.role}`}>
                        {emp.role === 'admin' ? '🛡 Admin' : '👤 Employee'}
                      </span>
                    </td>
                    <td>
                      <div className="emp-ops">
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(emp)} className="op-btn edit" title="Edit">
                          <Edit3 size={15} />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(emp.id, emp.name)} className="op-btn del" title="Remove">
                          <Trash2 size={15} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <style jsx>{`
        .emp-page { width: 100%; display: flex; flex-direction: column; gap: 24px; }

        /* Toast */
        .emp-toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          display: flex; align-items: center; gap: 10px;
          padding: 14px 22px; border-radius: 14px;
          font-size: 0.85rem; font-weight: 700;
          backdrop-filter: blur(10px); box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .emp-toast.success { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.25); }
        .emp-toast.error { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }

        /* Header */
        .emp-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
        .emp-title { font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 4px; }
        .emp-sub { font-size: 0.82rem; color: rgba(255,255,255,0.35); font-weight: 500; }

        .emp-add-btn {
          display: flex; align-items: center; gap: 8px;
          background: #4deaff; color: #000; border: none;
          padding: 12px 22px; border-radius: 14px;
          font-weight: 800; font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s;
        }
        .emp-add-btn:hover { background: #00d2ff; box-shadow: 0 8px 20px rgba(0,210,255,0.3); }
        .emp-add-btn.cancel { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.1); }
        .emp-add-btn.cancel:hover { background: rgba(255,255,255,0.1); box-shadow: none; }

        /* Form */
        .emp-form-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,210,255,0.15);
          border-radius: 20px; padding: 30px 28px;
        }
        .emp-form-card h3 { font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 24px; }
        .emp-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }

        .ff {
          position: relative; display: flex; align-items: center;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          overflow: hidden; transition: border-color 0.2s;
        }
        .ff:focus-within { border-color: #4deaff; }
        .ff :global(svg) { position: absolute; left: 14px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
        .ff input, .ff select {
          width: 100%; height: 48px; background: transparent;
          border: none; padding: 0 14px 0 42px;
          color: #fff; font-size: 0.875rem; font-family: 'Outfit', sans-serif;
        }
        .ff input:focus, .ff select:focus { outline: none; }
        .ff input::placeholder { color: rgba(255,255,255,0.25); }
        .ff select option { background: #0a0c14; }

        .emp-form-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .emp-save-btn {
          background: #4deaff; color: #000; border: none;
          padding: 12px 28px; border-radius: 12px;
          font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
        }
        .emp-save-btn:hover { box-shadow: 0 8px 20px rgba(0,210,255,0.3); }
        .emp-cancel-btn {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); padding: 12px 22px; border-radius: 12px;
          font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s;
        }
        .emp-cancel-btn:hover { background: rgba(255,255,255,0.08); }

        /* Search */
        .emp-search-row { display: flex; align-items: center; gap: 16px; }
        .emp-search-box {
          flex: 1; position: relative; display: flex; align-items: center;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; overflow: hidden; transition: border-color 0.2s;
        }
        .emp-search-box:focus-within { border-color: rgba(0,210,255,0.3); }
        .search-ico { position: absolute; left: 16px; color: rgba(255,255,255,0.25); }
        .emp-search-box input {
          width: 100%; height: 48px; background: transparent; border: none;
          padding: 0 16px 0 46px; color: #fff; font-size: 0.875rem; font-family: 'Outfit', sans-serif;
        }
        .emp-search-box input:focus { outline: none; }
        .emp-search-box input::placeholder { color: rgba(255,255,255,0.2); }
        .search-clear { position: absolute; right: 14px; background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; }
        .emp-count-badge { font-size: 0.72rem; font-weight: 800; color: rgba(255,255,255,0.35); white-space: nowrap; }

        /* Table */
        .emp-table-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; }
        .emp-table-wrap { overflow-x: auto; }
        .emp-table { width: 100%; border-collapse: collapse; }
        .emp-table thead tr th {
          padding: 16px 20px; text-align: left;
          font-size: 0.62rem; font-weight: 900; letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.2);
          white-space: nowrap;
        }
        .emp-row { border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.15s; }
        .emp-row:hover { background: rgba(255,255,255,0.025); }
        .emp-row:last-child { border-bottom: none; }
        .emp-row td { padding: 16px 20px; }

        .emp-identity { display: flex; align-items: center; gap: 14px; }
        .emp-av {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(0,210,255,0.08); border: 1px solid rgba(0,210,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; color: #4deaff; font-size: 1rem;
        }
        .emp-name { display: block; font-weight: 700; color: #fff; font-size: 0.9rem; margin-bottom: 2px; }
        .emp-email { display: block; font-size: 0.72rem; color: rgba(255,255,255,0.35); font-weight: 500; }

        .emp-designation { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.7); }

        .emp-dept-pill {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px;
          background: rgba(168,85,247,0.08); color: #a855f7;
          border: 1px solid rgba(168,85,247,0.15);
          padding: 4px 12px; border-radius: 20px; white-space: nowrap;
        }

        .emp-date { font-size: 0.8rem; color: rgba(255,255,255,0.45); font-weight: 600; }

        .emp-role-badge {
          font-size: 0.68rem; font-weight: 900; letter-spacing: 0.5px;
          padding: 4px 12px; border-radius: 20px; white-space: nowrap;
        }
        .emp-role-badge.admin { background: rgba(0,210,255,0.08); color: #4deaff; border: 1px solid rgba(0,210,255,0.15); }
        .emp-role-badge.employee { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.08); }

        .emp-ops { display: flex; gap: 8px; justify-content: flex-end; }
        .op-btn {
          width: 34px; height: 34px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; color: rgba(255,255,255,0.4);
        }
        .op-btn.edit:hover { background: rgba(0,210,255,0.1); color: #4deaff; border-color: rgba(0,210,255,0.2); }
        .op-btn.del:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2); }

        .emp-error {
          display: flex; align-items: center; gap: 8px;
          padding: 16px 20px; color: #ef4444; font-size: 0.85rem; font-weight: 600;
          border-bottom: 1px solid rgba(239,68,68,0.1);
        }

        .emp-empty {
          padding: 60px 20px; text-align: center;
          color: rgba(255,255,255,0.25); font-size: 0.9rem; font-style: italic;
        }

        .emp-loading { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: rgba(255,255,255,0.35); font-weight: 600; }
        .emp-spinner { width: 28px; height: 28px; border: 2px solid rgba(0,210,255,0.1); border-top-color: #4deaff; border-radius: 50%; animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) { .emp-form-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .emp-form-grid { grid-template-columns: 1fr; } .emp-title { font-size: 1.5rem; } }
      `}</style>
    </div>
  );
};

export default Employees;
