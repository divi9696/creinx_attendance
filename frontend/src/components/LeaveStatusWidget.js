import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveStatusWidget = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/leaves', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(response.data.leaves || []);
    } catch (err) {
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'declined':
        return 'badge-danger';
      default:
        return 'badge-warning';
    }
  };

  const filteredLeaves = filter === 'all'
    ? leaves
    : leaves.filter(leave => leave.status === filter);

  if (loading) return <div className="leave-status-widget"><p>Loading...</p></div>;

  return (
    <div className="leave-status-widget">
      <h3>My Leave Requests</h3>

      <div className="filter-buttons">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({leaves.length})
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending ({leaves.filter(l => l.status === 'pending').length})
        </button>
        <button
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Approved ({leaves.filter(l => l.status === 'approved').length})
        </button>
        <button
          className={filter === 'declined' ? 'active' : ''}
          onClick={() => setFilter('declined')}
        >
          Declined ({leaves.filter(l => l.status === 'declined').length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredLeaves.length === 0 ? (
        <p className="no-data">No leave requests found</p>
      ) : (
        <div className="leaves-list">
          {filteredLeaves.map(leave => (
            <div key={leave.id} className="leave-item">
              <div className="leave-dates">
                <span className="date-range">
                  {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="leave-info">
                <p className="reason">{leave.reason}</p>
              </div>
              <div className="leave-status">
                <span className={`badge ${getStatusBadgeColor(leave.status)}`}>
                  {leave.status.toUpperCase()}
                </span>
              </div>
              {leave.status === 'declined' && leave.decline_reason && (
                <div className="decline-reason">
                  <p><strong>Reason:</strong> {leave.decline_reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveStatusWidget;
