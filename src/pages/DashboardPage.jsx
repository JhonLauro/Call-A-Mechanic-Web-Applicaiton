import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const role = user?.role
    ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
    : 'User';

  return (
    <div className="dashboard-container">

      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </span>
          <span className="dashboard-brand-text">Call-A-Mechanic</span>
        </div>
        <div className="dashboard-header-right">
          <span className="dashboard-header-user">
            {user?.fullName || user?.email || 'User'}
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="dashboard-main">

        {/* Profile card */}
        <div className="dashboard-profile-card">
          <div className="dashboard-avatar">{initials}</div>
          <div className="dashboard-profile-info">
            <h2 className="dashboard-welcome">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!
            </h2>
            <p className="dashboard-subtitle">
              You're signed in to your Call-A-Mechanic account.
            </p>
            {user?.email && (
              <p className="dashboard-email">{user.email}</p>
            )}
          </div>
          <div className="dashboard-badge">{role}</div>
        </div>

        {/* Tiles */}
        <p className="dashboard-section-title">Quick Actions</p>
        <div className="dashboard-tiles">
          <div className="dashboard-tile">
            <div className="dashboard-tile-icon tile-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <h3>Request Service</h3>
            <p>Get a certified mechanic to your location fast.</p>
            <p className="dashboard-tile-arrow">Get started →</p>
          </div>
          <div className="dashboard-tile">
            <div className="dashboard-tile-icon tile-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h3>My Bookings</h3>
            <p>View and manage your service history.</p>
            <p className="dashboard-tile-arrow">View all →</p>
          </div>
          <div className="dashboard-tile">
            <div className="dashboard-tile-icon tile-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3>My Profile</h3>
            <p>Update your personal information and preferences.</p>
            <p className="dashboard-tile-arrow">Edit profile →</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;
