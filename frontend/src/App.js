import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ChangePassword from './components/ChangePassword';
import Login from './pages/Login';
import OTPAuthPage from './pages/OTPAuthPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Dashboards from './pages/Dashboards';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

import './styles/App.css';

function AppContent({ user, loading, onLoginSuccess, onPasswordChanged, onLogout }) {
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <img src="/logo.png" alt="Creinx" className="splash-logo" />
          <div className="splash-loader">
            <div className="loader-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user && user.first_login) {
    return <ChangePassword user={user} onPasswordChanged={onPasswordChanged} />;
  }

  if (loading) {
    return <div className="app-loading">Initializing System...</div>;
  }

  // ─── Login page: no sidebar ───
  const isLoginRoute = !user;
  if (isLoginRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={onLoginSuccess} />} />
        <Route path="/activate" element={<OTPAuthPage />} />
        <Route path="/forgot-password" element={<OTPAuthPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // ─── Authenticated: Sidebar Layout ───
  return (
    <AppLayout user={user} onLogout={onLogout}>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/dashboards"
          element={user.role === 'admin' ? <Dashboards /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/employees"
          element={user.role === 'admin' ? <Employees /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/reports"
          element={user.role === 'admin' ? <Reports /> : <Navigate to="/login" />}
        />

        {/* Employee Routes */}
        <Route
          path="/employee/dashboard"
          element={user.role === 'employee' ? <EmployeeDashboard /> : <Navigate to="/login" />}
        />

        {/* Shared */}
        <Route
          path="/change-password"
          element={<ChangePassword user={user} onPasswordChanged={onPasswordChanged} isManual={true} />}
        />
        <Route
          path="/notifications"
          element={<Notifications user={user} />}
        />

        <Route
          path="/"
          element={<Navigate to={user.role === 'admin' ? '/admin/dashboards' : '/employee/dashboard'} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem('user'); }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => setUser(userData);

  const handlePasswordChanged = () => setUser(prev => ({ ...prev, first_login: 0 }));

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
