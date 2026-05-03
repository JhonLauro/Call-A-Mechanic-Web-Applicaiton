import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointments } from '../../services/appointmentService';
import { getVehicles } from '../../services/vehicleService';
import { getProfile } from '../../services/profileService';
import VehicleManagement from '../../components/VehicleManagement';
import BookAppointment from '../../components/BookAppointment';
import Snackbar from '../../components/Snackbar';
import LoadingScreen from '../../components/LoadingScreen';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVehicleManagement, setShowVehicleManagement] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showMessage = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // Load vehicles from API
  const loadVehicles = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getVehicles(token);
      setVehicles(data || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      // Don't show error to user, vehicles is optional
    }
  }, [token]);

  // Load appointments
  const loadAppointments = useCallback(async ({ silent = false } = {}) => {
    if (!token) return;

    if (!silent) setLoading(true);
    try {
      const data = await getAppointments(token);
      setAppointments(data || []);
    } catch (err) {
      if (!silent) showMessage(err.message || 'Failed to load appointments.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAppointments();
    loadVehicles();
    if (token) {
      getProfile(token)
        .then((profileData) => {
          if (profileData) updateUser(profileData);
        })
        .catch(() => {});
    }
    const refreshTimer = setInterval(() => {
      loadAppointments({ silent: true });
      loadVehicles();
    }, 30000);

    return () => clearInterval(refreshTimer);
  }, [loadAppointments, loadVehicles, token, updateUser]);

  const sortAppointmentsNewestFirst = (a, b) => {
    const dateA = Date.parse(a.scheduledDate || '') || 0;
    const dateB = Date.parse(b.scheduledDate || '') || 0;
    if (dateA !== dateB) return dateB - dateA;
    return Number(b.id) - Number(a.id);
  };

  const sortedAppointments = [...appointments].sort(sortAppointmentsNewestFirst);

  // Calculate stats from real data
  const activeAppointments = sortedAppointments.filter(apt =>
    apt.status === 'PENDING' || apt.status === 'IN_PROGRESS'
  );
  const completedAppointments = sortedAppointments.filter(apt =>
    apt.status === 'FINISHED' || apt.status === 'COMPLETED'
  );

  const stats = {
    activeServices: activeAppointments.length,
    completedServices: completedAppointments.length,
    registeredVehicles: vehicles.length,
  };

  // Get current active service (most recent active)
  const currentAppointment = activeAppointments[0];
  const currentService = currentAppointment ? {
    vehicle: currentAppointment.vehicleInfo || 'Vehicle',
    year: '',
    description: currentAppointment.problemDescription || currentAppointment.serviceType || '-',
    jobId: `#${currentAppointment.id}`,
    submittedDate: currentAppointment.createdAt
      ? new Date(currentAppointment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '-',
    mechanic: currentAppointment.mechanic?.fullName || 'Awaiting Assignment',
    status: currentAppointment.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending',
  } : null;

  // Service history from real appointments
  const serviceHistory = sortedAppointments.map(apt => ({
    jobId: `#${apt.id}`,
    date: apt.scheduledDate
      ? new Date(apt.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '-',
    vehicle: apt.vehicleInfo || '-',
    description: apt.problemDescription || apt.serviceType || '-',
    status: apt.status === 'IN_PROGRESS' ? 'In Progress'
      : apt.status === 'FINISHED' || apt.status === 'COMPLETED' ? 'Finished'
      : apt.status === 'CANCELLED' ? 'Cancelled'
      : 'Pending',
  }));

  const handleAppointmentCreated = () => {
    loadAppointments();
    showMessage('Appointment booked successfully!');
  };

  const userName = user?.fullName || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const userPhoto = user?.photoUrl || user?.profilePhotoUrl || user?.avatarUrl || '';

  return (
    <div className="client-dashboard">
      {/* Header */}
      <header className="cd-header">
        <div className="cd-header-left">
          <div className="cd-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span className="cd-brand-name">Call-A-Mechanic</span>
        </div>
        <div className="cd-header-right">
          <button className="cd-icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="cd-notification-badge">2</span>
          </button>
          <button className="cd-icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <div className="cd-user-menu-wrapper">
            <button
              className="cd-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className={`cd-user-avatar ${userPhoto ? 'cd-user-avatar-photo' : ''}`}>
                {userPhoto ? <img src={userPhoto} alt={userName} /> : userInitials}
              </div>
              <span className="cd-user-name">{userName}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showUserMenu && (
              <div className="cd-user-dropdown">
                <Link to="/profile" className="cd-dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  My Profile
                </Link>
                <button className="cd-dropdown-item cd-logout" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cd-main">
        {/* Page Title */}
        <div className="cd-page-header">
          <h1 className="cd-page-title">Dashboard</h1>
          <p className="cd-page-subtitle">Track your vehicle service requests and history</p>
        </div>

        {/* Stats Cards */}
        <div className="cd-stats-grid">
          <div className="cd-stat-card">
            <div className="cd-stat-icon cd-stat-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="cd-stat-content">
              <span className="cd-stat-label">Active Service</span>
              <div className="cd-stat-value-row">
                <span className="cd-stat-value">{stats.activeServices}</span>
                <span className="cd-stat-badge cd-badge-active">Active</span>
              </div>
            </div>
          </div>

          <div className="cd-stat-card">
            <div className="cd-stat-icon cd-stat-icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="cd-stat-content">
              <span className="cd-stat-label">Completed Services</span>
              <span className="cd-stat-value">{stats.completedServices}</span>
            </div>
          </div>
        </div>

        {/* My Vehicles Section */}
        <div className="cd-vehicles-section">
          <div className="cd-vehicles-info">
            <div className="cd-vehicles-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div className="cd-vehicles-text">
              <span className="cd-vehicles-label">Registered Vehicles</span>
              <span className="cd-vehicles-count">{stats.registeredVehicles}</span>
            </div>
          </div>
          <button className="cd-vehicles-btn" onClick={() => setShowVehicleManagement(true)}>
            Manage Vehicles
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* Current Service Card */}
        {currentService && (
          <div className="cd-current-service">
            <div className="cd-current-service-header">
              <div className="cd-service-vehicle">
                <h3 className="cd-vehicle-name">{currentService.vehicle}</h3>
                <p className="cd-service-description">{currentService.description}</p>
              </div>
              <span className={`cd-status-badge ${currentService.status === 'In Progress' ? 'cd-status-progress' : 'cd-status-pending'}`}>{currentService.status}</span>
            </div>
            <div className="cd-service-details">
              <div className="cd-service-detail">
                <span className="cd-detail-label">Job ID</span>
                <span className="cd-detail-value">{currentService.jobId}</span>
              </div>
              <div className="cd-service-detail">
                <span className="cd-detail-label">Submitted</span>
                <span className="cd-detail-value">{currentService.submittedDate}</span>
              </div>
              <div className="cd-service-detail">
                <span className="cd-detail-label">Mechanic</span>
                <span className="cd-detail-value">{currentService.mechanic}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="cd-section">
          <h2 className="cd-section-title">Quick Actions</h2>
          <div className="cd-quick-actions">
            <div className="cd-action-card cd-action-primary">
              
              <div className="cd-action-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="cd-action-title">Book New Service</h3>
              <p className="cd-action-description">
                Schedule your vehicle maintenance appointment with our certified mechanics
              </p>
              <div className="cd-action-tags">
                <span className="cd-action-tag">Quick Response</span>
                <span className="cd-action-tag">Expert Service</span>
                
              </div>
              <button className="cd-action-btn" onClick={() => setShowBookAppointment(true)}>Book Appointment Now</button>
            </div>
          </div>
        </div>

        {/* Service History */}
        <div className="cd-section">
          <h2 className="cd-section-title">Service History</h2>
          <div className="cd-table-container">
            <table className="cd-table">
              <thead>
                <tr>
                  <th>JOB ID</th>
                  <th>DATE</th>
                  <th>VEHICLE</th>
                  <th>SERVICE DESCRIPTION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {serviceHistory.length > 0 ? (
                  serviceHistory.map((service, index) => (
                    <tr key={index}>
                      <td className="cd-table-jobid">{service.jobId}</td>
                      <td>{service.date}</td>
                      <td>{service.vehicle}</td>
                      <td>{service.description}</td>
                      <td>
                        <span className={`cd-table-status ${
                          service.status === 'In Progress' ? 'cd-status-progress'
                          : service.status === 'Completed' ? 'cd-status-fixed'
                          : service.status === 'Cancelled' ? 'cd-status-cancelled'
                          : 'cd-status-pending'
                        }`}>
                          {service.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: loading ? '0' : '2rem', color: '#6b7280' }}>
                      {loading ? <LoadingScreen compact /> : 'No service history yet. Book your first appointment!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Vehicle Management Overlay */}
      <VehicleManagement
        isOpen={showVehicleManagement}
        onClose={() => setShowVehicleManagement(false)}
        onVehicleChange={(updatedVehicles) => setVehicles(updatedVehicles)}
      />

      {/* Book Appointment Overlay */}
      <BookAppointment
        isOpen={showBookAppointment}
        onClose={() => setShowBookAppointment(false)}
        onSuccess={handleAppointmentCreated}
        vehicles={vehicles}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ClientDashboard;
