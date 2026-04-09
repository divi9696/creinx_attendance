import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../apiConfig';

const LeaveRequestWidget = ({ onApprovalAction }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [declineReason, setDeclineReason] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/leaves/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data.leaves || []);
    } catch (err) {
      setError('Failed to fetch pending leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    setActionLoading(prev => ({ ...prev, [leaveId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/leaves/admin/${leaveId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from list
      setLeaves(leaves.filter(l => l.id !== leaveId));
      if (onApprovalAction) onApprovalAction();
    } catch (err) {
      setError('Failed to approve leave');
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleDecline = async (leaveId) => {
    setActionLoading(prev => ({ ...prev, [leaveId]: true }));
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/leaves/admin/${leaveId}/decline`,
        { reason: declineReason[leaveId] || 'Declined by admin' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from list
      setLeaves(leaves.filter(l => l.id !== leaveId));
      setDeclineReason(prev => ({ ...prev, [leaveId]: '' }));
      if (onApprovalAction) onApprovalAction();
    } catch (err) {
      setError('Failed to decline leave');
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  if (loading) return <div className="leave-request-widget"><p>Loading...</p></div>;

  return (
    <div className="leave-request-widget">
      <h3>Pending Leave Requests {leaves.length > 0 && <span className="badge badge-warning">{leaves.length}</span>}</h3>

      {error && <div className="error-message">{error}</div>}

      {leaves.length === 0 ? (
        <p className="no-data">No pending leave requests</p>
      ) : (
        <div className="leaves-table">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => (
                <tr key={leave.id}>
                  <td>
                    <strong>{leave.employee_name}</strong>
                    <br />
                    <small>{leave.employee_email}</small>
                  </td>
                  <td>
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td>{leave.reason}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(leave.id)}
                        disabled={actionLoading[leave.id]}
                      >
                        {actionLoading[leave.id] ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => handleDecline(leave.id)}
                        disabled={actionLoading[leave.id]}
                      >
                        {actionLoading[leave.id] ? 'Processing...' : 'Decline'}
                      </button>
                    </div>
                    {!actionLoading[leave.id] && (
                      <input
                        type="text"
                        placeholder="Decline reason (optional)"
                        value={declineReason[leave.id] || ''}
                        onChange={(e) => setDeclineReason(prev => ({ ...prev, [leave.id]: e.target.value }))}
                        className="decline-input"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestWidget;
