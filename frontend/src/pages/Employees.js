import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';
import '../styles/Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    job_role: '',
    date_of_join: '',
    department: '',
    role: 'employee'
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
      setError('Failed to fetch employees');
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

      setSubmitSuccess(editingId ? 'Profile updated!' : 'Employee added!');
      setFormData({ name: '', email: '', job_role: '', date_of_join: '', department: '', role: 'employee' });
      setShowForm(false);
      setEditingId(null);
      fetchEmployees();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError('Operation failed. Please try again.');
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
    if (!window.confirm('Permanently remove this employee?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/employee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitSuccess('Employee removed!');
      fetchEmployees();
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setError('Delete failed.');
    }
  };

  if (loading) return <div className="page-loading">Loading Workforce...</div>;

  return (
    <div className="employees-page animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <h1>Workforce Management</h1>
          <p>Maintain and monitor your team directory</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); if (showForm) setEditingId(null); }} 
          className="btn-primary"
        >
          {showForm ? '✕ Close' : '+ Add Employee'}
        </button>
      </header>

      {submitSuccess && <div className="success-toast">{submitSuccess}</div>}
      {error && <div className="error-toast">{error}</div>}

      {showForm && (
        <div className="glass-panel form-container animate-fade-in">
          <form onSubmit={handleSubmit} className="premium-form">
            <h2>{editingId ? 'Edit Profile' : 'New Personnel'}</h2>
            <div className="form-grid">
              <input type="text" className="glass-input" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input type="email" className="glass-input" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <input type="text" className="glass-input" placeholder="Job Role" value={formData.job_role} onChange={e => setFormData({...formData, job_role: e.target.value})} />
              <input type="date" className="glass-input" value={formData.date_of_join} onChange={e => setFormData({...formData, date_of_join: e.target.value})} />
              <input type="text" className="glass-input" placeholder="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              <select className="glass-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="employee">Employee</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn-primary submit-btn">{editingId ? 'Save Changes' : 'Initialize Employee'}</button>
          </form>
        </div>
      )}

      <div className="glass-panel table-container">
        <table className="premium-table">
          <thead>
            <tr>
              <th>IDENTITY</th>
              <th>ROLE & DEPT</th>
              <th>JOINED</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="table-row">
                <td>
                  <div className="user-cell">
                    <div className="avatar">{emp.name[0]}</div>
                    <div className="info">
                      <span className="name">{emp.name}</span>
                      <span className="email">{emp.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="role-cell">
                    <span className="role">{emp.job_role || 'Staff'}</span>
                    <span className="dept">{emp.department || 'N/A'}</span>
                  </div>
                </td>
                <td>{emp.date_of_join ? new Date(emp.date_of_join).toLocaleDateString() : '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="action-group">
                    <button className="action-btn edit" onClick={() => handleEdit(emp)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDelete(emp.id)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .employees-page { padding: 40px 20px; max-width: 1200px; margin: 0 auto; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .form-container { padding: 30px; margin-bottom: 40px; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
        .submit-btn { width: 100%; height: 50px; }
        .table-container { padding: 0; overflow: hidden; }
        .premium-table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 20px; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 1px solid var(--glass-border); }
        .table-row { transition: var(--transition); border-bottom: 1px solid var(--glass-border); }
        .table-row:hover { background: rgba(255, 255, 255, 0.02); }
        .table-row td { padding: 20px; }
        .user-cell { display: flex; align-items: center; gap: 15px; }
        .avatar { width: 40px; height: 40px; background: linear-gradient(135deg, var(--accent-blue), var(--primary-glow)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; }
        .info { display: flex; flex-direction: column; }
        .name { font-weight: 600; font-size: 0.95rem; }
        .email { font-size: 0.8rem; color: var(--text-muted); }
        .role-cell { display: flex; flex-direction: column; }
        .role { font-weight: 500; font-size: 0.9rem; }
        .dept { font-size: 0.75rem; color: var(--primary-glow); font-weight: 700; text-transform: uppercase; }
        .action-group { display: flex; gap: 10px; justify-content: flex-end; }
        .action-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: var(--transition); font-size: 0.8rem; }
        .action-btn.edit:hover { color: var(--primary-glow); border-color: var(--primary-glow); }
        .action-btn.delete:hover { color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .success-toast { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 12px 24px; border-radius: 12px; margin-bottom: 20px; border: 1px solid rgba(34, 197, 94, 0.2); text-align: center; }
      `}</style>
    </div>
  );
};

export default Employees;
