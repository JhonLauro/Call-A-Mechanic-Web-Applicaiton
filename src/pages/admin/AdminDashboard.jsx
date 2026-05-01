import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointments, updateAppointmentStatus } from '../../services/appointmentService';
import { getAllUsers, assignMechanic } from '../../services/adminService';
import CreateMechanicModal from '../../components/CreateMechanicModal';
import AppointmentDetailsPanel from '../../components/AppointmentDetailsPanel';
import Snackbar from '../../components/Snackbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMechanic, setShowCreateMechanic] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showMessage = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // Load appointments and users
  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const [appointmentsData, usersData] = await Promise.all([
        getAppointments(token),
        getAllUsers(token)
      ]);

      setAppointments(appointmentsData || []);

      // Extract mechanics from users list
      if (usersData?.users) {
        const mechanicsList = usersData.users.filter(u => u.role === 'MECHANIC');
        setMechanics(mechanicsList);
      }
    } catch (err) {
      showMessage(err.message || 'Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Transform appointment data from API format to display format
  const transformAppointment = (apt) => ({
    id: apt.id,
    clientName: apt.client?.fullName || 'Unknown',
    contactNumber: apt.client?.phoneNumber || '-',
    vehicle: apt.vehicleInfo || '-',
    carIssue: apt.problemDescription || apt.serviceType || '-',
    appointmentDate: apt.scheduledDate ? new Date(apt.scheduledDate).toLocaleDateString() : '-',
    scheduledDate: apt.scheduledDate,
    mechanic: apt.mechanic?.fullName || 'Unassigned',
    mechanicId: apt.mechanic?.id || null,
    status: apt.status === 'COMPLETED' ? 'FINISHED' : apt.status,
    serviceType: apt.serviceType,
  });

  // Calculate stats
  const today = new Date().toDateString();
  const stats = {
    totalAppointmentsToday: appointments.filter(apt =>
      apt.scheduledDate && new Date(apt.scheduledDate).toDateString() === today
    ).length,
    pendingJobs: appointments.filter(apt => apt.status === 'PENDING').length,
    inProgressJobs: appointments.filter(apt => apt.status === 'IN_PROGRESS').length,
    finishedJobs: appointments.filter(apt => apt.status === 'FINISHED' || apt.status === 'COMPLETED').length,
    totalMechanics: mechanics.length,
  };

  const userName = user?.fullName || 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Filter appointments
  const filteredAppointments = appointments.map(transformAppointment).filter(apt => {
    const matchesSearch =
      apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(apt.id).includes(searchQuery) ||
      apt.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const matchesDate = !dateFilter || (apt.scheduledDate && apt.scheduledDate.startsWith(dateFilter));
    return matchesSearch && matchesStatus && matchesDate;
  });
  const isFinishedStatus = (status) => status === 'FINISHED' || status === 'COMPLETED';
  const activeAppointments = filteredAppointments.filter(apt => !isFinishedStatus(apt.status));
  const finishedAppointments = filteredAppointments.filter(apt => isFinishedStatus(apt.status));

  // Update appointment status
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus, token);

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      // Update selected appointment if open
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
      }

      showMessage('Status updated successfully!');
    } catch (err) {
      showMessage(err.message || 'Failed to update status.', 'error');
    }
  };

  // Assign mechanic to appointment
  const handleAssignMechanic = async (appointmentId, mechanicUserId) => {
    try {
      const result = await assignMechanic(appointmentId, mechanicUserId, token);

      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? result : apt
        )
      );

      // Update selected appointment if open
      if (selectedAppointment?.id === appointmentId) {
        const transformed = transformAppointment(result);
        setSelectedAppointment(transformed);
      }

      showMessage('Mechanic assigned successfully!');
    } catch (err) {
      showMessage(err.message || 'Failed to assign mechanic.', 'error');
    }
  };

  const handleMechanicCreated = () => {
    loadData();
    showMessage('Mechanic created successfully!');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'ad-status-pending';
      case 'IN_PROGRESS': return 'ad-status-progress';
      case 'FINISHED':
      case 'COMPLETED': return 'ad-status-finished';
      case 'CANCELLED': return 'ad-status-cancelled';
      default: return '';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'In Progress';
      case 'PENDING': return 'Pending';
      case 'FINISHED':
      case 'COMPLETED': return 'Finished';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="ad-header">
        <div className="ad-header-left">
          <div className="ad-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <span className="ad-brand-name">Call-A-Mechanic</span>
          <span className="ad-admin-badge">Admin</span>
        </div>
        <div className="ad-header-right">
          <button className="ad-icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="ad-notification-badge">{stats.pendingJobs}</span>
          </button>
          <div className="ad-user-menu-wrapper">
            <button
              className="ad-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="ad-user-avatar">{userInitials}</div>
              <span className="ad-user-name">{userName}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showUserMenu && (
              <div className="ad-user-dropdown">
                <Link to="/admin/profile" className="ad-dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  My Profile
                </Link>
                <button className="ad-dropdown-item ad-logout" onClick={handleLogout}>
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
      <main className="ad-main">
        {/* Page Header */}
        <div className="ad-page-header">
          <div className="ad-page-header-left">
            <h1 className="ad-page-title">Admin Dashboard</h1>
            <p className="ad-page-subtitle">Monitor the shop, appointments, and staff activity</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="ad-stats-grid">
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="ad-stat-content">
              <span className="ad-stat-label">Appointments Today</span>
              <span className="ad-stat-value">{stats.totalAppointmentsToday}</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="ad-stat-content">
              <span className="ad-stat-label">Pending Jobs</span>
              <span className="ad-stat-value">{stats.pendingJobs}</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon-indigo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="ad-stat-content">
              <span className="ad-stat-label">In Progress</span>
              <span className="ad-stat-value">{stats.inProgressJobs}</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="ad-stat-content">
              <span className="ad-stat-label">Finished Jobs</span>
              <span className="ad-stat-value">{stats.finishedJobs}</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-stat-icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="ad-stat-content">
              <span className="ad-stat-label">Total Mechanics</span>
              <span className="ad-stat-value">{stats.totalMechanics}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ad-quick-actions">
          <button className="ad-quick-action ad-quick-action-primary" onClick={() => setShowCreateMechanic(true)}>
            <div className="ad-quick-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <span>Create New Mechanic</span>
          </button>
          <button className="ad-quick-action" onClick={() => navigate('/admin/users')}>
            <div className="ad-quick-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>User Registry</span>
          </button>
          <button className="ad-quick-action" onClick={loadData}>
            <div className="ad-quick-action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </div>
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Active Service Queue */}
        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Active Service Queue</h2>
            <span className="ad-section-count">{activeAppointments.length} appointments</span>
          </div>

          {/* Filters */}
          <div className="ad-filters">
            <div className="ad-search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by client, job ID, or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ad-search-input"
              />
            </div>
            <div className="ad-filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="ad-filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FINISHED">Finished</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="ad-filter-date"
              />
            </div>
          </div>

          {/* Table */}
          <div className="ad-table-container">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>JOB ID</th>
                  <th>CLIENT</th>
                  <th>CONTACT</th>
                  <th>VEHICLE</th>
                  <th>CAR ISSUE</th>
                  <th>DATE</th>
                  <th>MECHANIC</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {activeAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="ad-table-jobid">#{appointment.id}</td>
                    <td className="ad-table-client">{appointment.clientName}</td>
                    <td>{appointment.contactNumber}</td>
                    <td>{appointment.vehicle}</td>
                    <td className="ad-table-issue">{appointment.carIssue}</td>
                    <td>{appointment.appointmentDate}</td>
                    <td>
                      <span className={appointment.mechanic === 'Unassigned' ? 'ad-unassigned' : ''}>
                        {appointment.mechanic}
                      </span>
                    </td>
                    <td>
                      <span className={`ad-table-status ${getStatusBadgeClass(appointment.status)}`}>
                        {formatStatus(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ad-view-btn"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activeAppointments.length === 0 && (
              <div className="ad-no-results">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>No active appointments found matching your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Finished Service Records */}
        <div className="ad-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title">Finished Service Records</h2>
            <span className="ad-section-count">{finishedAppointments.length} appointments</span>
          </div>

          <div className="ad-table-container">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>JOB ID</th>
                  <th>CLIENT</th>
                  <th>CONTACT</th>
                  <th>VEHICLE</th>
                  <th>CAR ISSUE</th>
                  <th>DATE</th>
                  <th>MECHANIC</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {finishedAppointments.map((appointment) => (
                  <tr key={`finished-${appointment.id}`}>
                    <td className="ad-table-jobid">#{appointment.id}</td>
                    <td className="ad-table-client">{appointment.clientName}</td>
                    <td>{appointment.contactNumber}</td>
                    <td>{appointment.vehicle}</td>
                    <td className="ad-table-issue">{appointment.carIssue}</td>
                    <td>{appointment.appointmentDate}</td>
                    <td>
                      <span className={appointment.mechanic === 'Unassigned' ? 'ad-unassigned' : ''}>
                        {appointment.mechanic}
                      </span>
                    </td>
                    <td>
                      <span className={`ad-table-status ${getStatusBadgeClass(appointment.status)}`}>
                        {formatStatus(appointment.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ad-view-btn"
                        onClick={() => setSelectedAppointment(appointment)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {finishedAppointments.length === 0 && (
              <div className="ad-no-results">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>No finished appointments found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Mechanic Modal */}
      <CreateMechanicModal
        isOpen={showCreateMechanic}
        onClose={() => setShowCreateMechanic(false)}
        onSuccess={handleMechanicCreated}
      />

      {/* Appointment Details Panel */}
      <AppointmentDetailsPanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusUpdate={handleStatusUpdate}
        onAssignMechanic={handleAssignMechanic}
        mechanics={mechanics}
        isAdmin={true}
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

export default AdminDashboard;
