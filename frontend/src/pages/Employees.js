import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    department: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.employees);
      setError('');
    } catch (err) {
      setError('Failed to fetch employees');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.job_role || !formData.date_of_join) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/admin/employees', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubmitSuccess('Employee added successfully!');
      setFormData({
        name: '',
        email: '',
        job_role: '',
        date_of_join: '',
        department: ''
      });
      setShowForm(false);

      // Refresh employee list
      fetchEmployees();

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to add employee');
      console.error(err);
    }
  };

  if (loading) return <div className="employees-container"><div className="loading">Loading employees...</div></div>;

  return (
    <div className="employees-container">
      <div className="employees-header">
        <h1>Employees Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="add-employee-btn"
        >
          {showForm ? '✕ Cancel' : '+ Add Employee'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {submitError && <div className="error-message">{submitError}</div>}
      {submitSuccess && <div className="success-message">{submitSuccess}</div>}

      {showForm && (
        <div className="add-employee-form-container">
          <form onSubmit={handleSubmit} className="add-employee-form">
            <h2>Add New Employee</h2>
            
            <div className="default-password-notice">
              <strong>ℹ️ Default Password:</strong> creinx123 (Employee must change on first login)
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Employee Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter employee name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email ID *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job_role">Job Role *</label>
                <input
                  type="text"
                  id="job_role"
                  name="job_role"
                  value={formData.job_role}
                  onChange={handleInputChange}
                  placeholder="e.g., Developer, Designer"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date_of_join">Date of Join *</label>
                <input
                  type="date"
                  id="date_of_join"
                  name="date_of_join"
                  value={formData.date_of_join}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., IT, HR"
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">Add Employee</button>
          </form>
        </div>
      )}

      <div className="employees-list-container">
        <h2>All Employees ({employees.length})</h2>
        {employees.length === 0 ? (
          <div className="no-employees">No employees found</div>
        ) : (
          <div className="employees-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job Role</th>
                  <th>Date of Join</th>
                  <th>Department</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.job_role || '-'}</td>
                    <td>{employee.date_of_join || '-'}</td>
                    <td>{employee.department || '-'}</td>
                    <td><span className="role-badge">{employee.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;
