import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChangePassword from './components/ChangePassword';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Dashboards from './pages/Dashboards';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import './styles/App.css';

function AppContent({ user, loading, onLoginSuccess, onPasswordChanged, onLogout }) {
  // If user needs to change password on first login, show the change password modal
  if (user && user.first_login) {
    return <ChangePassword user={user} onPasswordChanged={onPasswordChanged} />;
  }

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
        <Route
          path="/admin/dashboards"
          element={user?.role === 'admin' ? <Dashboards /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/employees"
          element={user?.role === 'admin' ? <Employees /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/reports"
          element={user?.role === 'admin' ? <Reports /> : <Navigate to="/login" />}
        />
        <Route
          path="/employee/dashboard"
          element={user?.role === 'employee' ? <EmployeeDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/change-password"
          element={user ? <ChangePassword user={user} onPasswordChanged={onPasswordChanged} isManual={true} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboards' : '/employee/dashboard'} /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handlePasswordChanged = () => {
    // Update user state to remove first_login flag
    const updatedUser = { ...user, first_login: 0 };
    setUser(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <AppContent 
        user={user} 
        loading={loading} 
        onLoginSuccess={handleLoginSuccess}
        onPasswordChanged={handlePasswordChanged}
        onLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
