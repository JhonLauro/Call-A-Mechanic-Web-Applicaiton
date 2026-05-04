import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAppointments, claimAppointment, updateAppointmentStatus } from '../../services/appointmentService';
import { getProfile } from '../../services/profileService';
import AppointmentDetailsPanel from '../../components/AppointmentDetailsPanel';
import Snackbar from '../../components/Snackbar';
import LoadingScreen from '../../components/LoadingScreen';
import ThemeToggle from '../../components/ThemeToggle';
import './MechanicDashboard.css';

const normalizeStatus = (status) => (status === 'COMPLETED' ? 'FINISHED' : status);

const formatStatus = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'IN_PROGRESS') return 'In Progress';
  if (normalized === 'PENDING') return 'Pending';
  if (normalized === 'FINISHED') return 'Finished';
  return normalized || 'Unknown';
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'No schedule';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'No schedule';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getMechanicId = (appointment) =>
  appointment?.mechanic?.id ?? appointment?.mechanicId ?? appointment?.mechanic?.userId ?? null;

const getDisplayAppointment = (appointment) => ({
  id: appointment?.id,
  clientName: appointment?.client?.fullName || appointment?.clientName || 'Unknown client',
  contactNumber: appointment?.client?.phoneNumber || appointment?.contactNumber || 'No contact',
  vehicle: appointment?.vehicleInfo || appointment?.vehicle || 'No vehicle info',
  issue: appointment?.problemDescription || appointment?.serviceType || 'No problem description',
  serviceType: appointment?.serviceType || '-',
  scheduledDate: appointment?.scheduledDate || '',
  appointmentDate: formatDate(appointment?.scheduledDate),
  mechanicName: appointment?.mechanic?.fullName || 'Unassigned',
  status: normalizeStatus(appointment?.status),
});

const getStatusBadgeClass = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'PENDING') return 'md-status-pending';
  if (normalized === 'IN_PROGRESS') return 'md-status-progress';
  if (normalized === 'FINISHED') return 'md-status-finished';
  return '';
};

const sortAppointmentsNewestFirst = (a, b) => {
  const dateA = Date.parse(a?.scheduledDate || '') || 0;
  const dateB = Date.parse(b?.scheduledDate || '') || 0;
  if (dateA !== dateB) return dateB - dateA;
  return Number(b?.id || 0) - Number(a?.id || 0);
};

const MechanicDashboard = () => {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const userName = user?.fullName || 'Mechanic';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const userPhoto = user?.photoUrl || user?.profilePhotoUrl || user?.avatarUrl || '';

  const showMessage = useCallback((message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAssignedToCurrentMechanic = useCallback(
    (appointment) => {
      const currentUserIds = [user?.id, user?.userId, user?.mechanicId]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value));

      const appointmentMechanicIds = [getMechanicId(appointment)]
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value));

      if (appointmentMechanicIds.some((id) => currentUserIds.includes(id))) {
        return true;
      }

      return Boolean(
        appointment?.mechanic?.fullName &&
          user?.fullName &&
          appointment.mechanic.fullName.toLowerCase() === user.fullName.toLowerCase()
      );
    },
    [user]
  );

  const isUnassignedPending = useCallback((appointment) => {
    const status = normalizeStatus(appointment?.status);
    const mechanicId = getMechanicId(appointment);
    return status === 'PENDING' && !appointment?.mechanic && (mechanicId === null || mechanicId === undefined);
  }, []);

  const loadAppointments = useCallback(async ({ silent = false } = {}) => {
    if (!token) return;

    if (!silent) setLoading(true);
    try {
      const data = await getAppointments(token);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      if (!silent) showMessage(error.message || 'Failed to load appointments.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, showMessage]);

  useEffect(() => {
    loadAppointments();
    if (token) {
      getProfile(token)
        .then((profileData) => {
          if (profileData) updateUser(profileData);
        })
        .catch(() => {});
    }
    const refreshTimer = setInterval(() => {
      loadAppointments({ silent: true });
    }, 30000);

    return () => clearInterval(refreshTimer);
  }, [loadAppointments, token, updateUser]);

  const sortedAppointments = [...appointments].sort(sortAppointmentsNewestFirst);
  const newServiceRequests = sortedAppointments.filter(isUnassignedPending);
  const myAssignedJobs = sortedAppointments.filter(isAssignedToCurrentMechanic);
  const myActiveJobs = myAssignedJobs.filter((appointment) => {
    const status = normalizeStatus(appointment.status);
    return status === 'PENDING' || status === 'IN_PROGRESS';
  });
  const inProgressJobs = myAssignedJobs.filter((appointment) => normalizeStatus(appointment.status) === 'IN_PROGRESS');
  const finishedJobs = myAssignedJobs.filter((appointment) => normalizeStatus(appointment.status) === 'FINISHED');

  const handleClaimJob = async (appointmentId) => {
    if (!token) return;

    const actionKey = `claim-${appointmentId}`;
    setBusyAction(actionKey);
    try {
      await claimAppointment(appointmentId, token);
      showMessage('Job claimed successfully.');
      await loadAppointments({ silent: true });
    } catch (error) {
      showMessage(error.message || 'Failed to claim job.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (!token) return;

    const actionKey = `status-${appointmentId}-${newStatus}`;
    setBusyAction(actionKey);
    try {
      await updateAppointmentStatus(appointmentId, newStatus, token);
      setSelectedAppointment((prev) => (prev?.id === appointmentId ? { ...prev, status: newStatus } : prev));
      showMessage(`Appointment marked as ${formatStatus(newStatus)}.`);
      await loadAppointments({ silent: true });
    } catch (error) {
      showMessage(error.message || 'Failed to update appointment status.', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const openDetails = (appointment) => {
    const details = getDisplayAppointment(appointment);
    setSelectedAppointment({
      id: details.id,
      clientName: details.clientName,
      contactNumber: details.contactNumber,
      vehicle: details.vehicle,
      appointmentDate: details.appointmentDate,
      carIssue: details.issue,
      mechanic: details.mechanicName,
      status: details.status,
      serviceType: details.serviceType,
    });
  };

  if (loading) {
    return (
      <div className="mechanic-dashboard">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="mechanic-dashboard">
      <header className="md-header">
        <div className="md-topbar">
          <div className="md-logo-wrap">
            <div className="md-logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="md-brand-name">Call-A-Mechanic</span>
            <span className="md-role-badge">Mechanic</span>
          </div>

          <div className="md-user-menu">
            <button className="md-icon-btn" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="md-notification-badge">{newServiceRequests.length}</span>
            </button>
            <ThemeToggle />

            <div className="md-user-menu-wrapper">
              <button className="md-user-btn" onClick={() => setShowUserMenu((prev) => !prev)} type="button">
                <div className={`md-user-avatar ${userPhoto ? 'md-user-avatar-photo' : ''}`}>
                  {userPhoto ? <img src={userPhoto} alt={userName} /> : userInitials}
                </div>
                <span className="md-user-name">{userName}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="md-user-dropdown">
                  <Link to="/profile" className="md-dropdown-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </Link>
                  <button className="md-dropdown-item md-logout" onClick={handleLogout} type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="md-main">
        <div className="md-page-header">
          <h1 className="md-page-title">Mechanic Dashboard</h1>
          <p className="md-page-subtitle">Manage assigned repair jobs and update service progress</p>
        </div>

        <div className="md-stats-grid">
          <div className="md-stat-card">
            <div className="md-stat-icon md-stat-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div className="md-stat-content">
              <span className="md-stat-label">New Jobs</span>
              <span className="md-stat-value">{newServiceRequests.length}</span>
            </div>
          </div>
          <div className="md-stat-card">
            <div className="md-stat-icon md-stat-icon-indigo">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
                <circle cx="12" cy="7" r="4" />
                <path d="M20 8v6" />
                <path d="M23 11h-6" />
              </svg>
            </div>
            <div className="md-stat-content">
              <span className="md-stat-label">My Active Jobs</span>
              <span className="md-stat-value">{myActiveJobs.length}</span>
            </div>
          </div>
          <div className="md-stat-card">
            <div className="md-stat-icon md-stat-icon-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <path d="M21 3v6h-6" />
              </svg>
            </div>
            <div className="md-stat-content">
              <span className="md-stat-label">In Progress</span>
              <span className="md-stat-value">{inProgressJobs.length}</span>
            </div>
          </div>
          <div className="md-stat-card">
            <div className="md-stat-icon md-stat-icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
            </div>
            <div className="md-stat-content">
              <span className="md-stat-label">Finished Jobs</span>
              <span className="md-stat-value">{finishedJobs.length}</span>
            </div>
          </div>
        </div>

        <section className="md-section">
          <div className="md-section-header">
            <h2 className="md-section-title">New Service Requests</h2>
            <span className="md-section-count">{newServiceRequests.length}</span>
          </div>
          <div className="md-card">
            {newServiceRequests.length === 0 ? (
              <div className="md-empty-state">No new unassigned requests right now.</div>
            ) : (
              <>
                <div className="md-table-wrap">
                  <table className="md-table">
                    <thead>
                      <tr>
                        <th>JOB ID</th>
                        <th>CLIENT</th>
                        <th>CONTACT</th>
                        <th>VEHICLE</th>
                        <th>PROBLEM</th>
                        <th>SCHEDULED</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newServiceRequests.map((appointment) => {
                        const item = getDisplayAppointment(appointment);
                        const actionKey = `claim-${item.id}`;
                        return (
                          <tr key={item.id}>
                            <td className="md-job-id">#{item.id}</td>
                            <td>{item.clientName}</td>
                            <td>{item.contactNumber}</td>
                            <td>{item.vehicle}</td>
                            <td>{item.issue}</td>
                            <td>{item.appointmentDate}</td>
                            <td>
                              <span className={`md-status-badge ${getStatusBadgeClass(item.status)}`}>
                                {formatStatus(item.status)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="md-btn-primary md-btn-small"
                                type="button"
                                onClick={() => handleClaimJob(item.id)}
                                disabled={busyAction === actionKey}
                              >
                                Claim Job
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md-job-cards">
                  {newServiceRequests.map((appointment) => {
                    const item = getDisplayAppointment(appointment);
                    const actionKey = `claim-${item.id}`;
                    return (
                      <article className="md-job-card" key={`card-${item.id}`}>
                        <div className="md-job-card-header">
                          <span className="md-job-id">#{item.id}</span>
                          <span className={`md-status-badge ${getStatusBadgeClass(item.status)}`}>{formatStatus(item.status)}</span>
                        </div>
                        <p><strong>Client:</strong> {item.clientName}</p>
                        <p><strong>Contact:</strong> {item.contactNumber}</p>
                        <p><strong>Vehicle:</strong> {item.vehicle}</p>
                        <p><strong>Problem:</strong> {item.issue}</p>
                        <p><strong>Scheduled:</strong> {item.appointmentDate}</p>
                        <button
                          className="md-btn-primary md-btn-small"
                          type="button"
                          onClick={() => handleClaimJob(item.id)}
                          disabled={busyAction === actionKey}
                        >
                          Claim Job
                        </button>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="md-section">
          <div className="md-section-header">
            <h2 className="md-section-title">My Assigned Jobs</h2>
            <span className="md-section-count">{myActiveJobs.length}</span>
          </div>
          <div className="md-card">
            {myActiveJobs.length === 0 ? (
              <div className="md-empty-state">You do not have active assigned jobs right now.</div>
            ) : (
              <>
                <div className="md-table-wrap">
                  <table className="md-table">
                    <thead>
                      <tr>
                        <th>JOB ID</th>
                        <th>CLIENT</th>
                        <th>CONTACT</th>
                        <th>VEHICLE</th>
                        <th>PROBLEM</th>
                        <th>SCHEDULED</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myActiveJobs.map((appointment) => {
                        const item = getDisplayAppointment(appointment);
                        const startKey = `status-${item.id}-IN_PROGRESS`;
                        const finishKey = `status-${item.id}-FINISHED`;
                        return (
                          <tr key={item.id}>
                            <td className="md-job-id">#{item.id}</td>
                            <td>{item.clientName}</td>
                            <td>{item.contactNumber}</td>
                            <td>{item.vehicle}</td>
                            <td>{item.issue}</td>
                            <td>{item.appointmentDate}</td>
                            <td>
                              <span className={`md-status-badge ${getStatusBadgeClass(item.status)}`}>
                                {formatStatus(item.status)}
                              </span>
                            </td>
                            <td>
                              <div className="md-row-actions">
                                {item.status === 'PENDING' && (
                                  <button
                                    className="md-btn-primary md-btn-small"
                                    type="button"
                                    onClick={() => handleStatusUpdate(item.id, 'IN_PROGRESS')}
                                    disabled={busyAction === startKey}
                                  >
                                    Start Repair
                                  </button>
                                )}
                                {item.status === 'IN_PROGRESS' && (
                                  <button
                                    className="md-btn-success md-btn-small"
                                    type="button"
                                    onClick={() => handleStatusUpdate(item.id, 'FINISHED')}
                                    disabled={busyAction === finishKey}
                                  >
                                    Mark Finished
                                  </button>
                                )}
                                <button className="md-btn-secondary md-btn-small" type="button" onClick={() => openDetails(appointment)}>
                                  View Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md-job-cards">
                  {myActiveJobs.map((appointment) => {
                    const item = getDisplayAppointment(appointment);
                    const startKey = `status-${item.id}-IN_PROGRESS`;
                    const finishKey = `status-${item.id}-FINISHED`;
                    return (
                      <article className="md-job-card" key={`assigned-${item.id}`}>
                        <div className="md-job-card-header">
                          <span className="md-job-id">#{item.id}</span>
                          <span className={`md-status-badge ${getStatusBadgeClass(item.status)}`}>{formatStatus(item.status)}</span>
                        </div>
                        <p><strong>Client:</strong> {item.clientName}</p>
                        <p><strong>Contact:</strong> {item.contactNumber}</p>
                        <p><strong>Vehicle:</strong> {item.vehicle}</p>
                        <p><strong>Problem:</strong> {item.issue}</p>
                        <p><strong>Scheduled:</strong> {item.appointmentDate}</p>
                        <div className="md-row-actions">
                          {item.status === 'PENDING' && (
                            <button
                              className="md-btn-primary md-btn-small"
                              type="button"
                              onClick={() => handleStatusUpdate(item.id, 'IN_PROGRESS')}
                              disabled={busyAction === startKey}
                            >
                              Start Repair
                            </button>
                          )}
                          {item.status === 'IN_PROGRESS' && (
                            <button
                              className="md-btn-success md-btn-small"
                              type="button"
                              onClick={() => handleStatusUpdate(item.id, 'FINISHED')}
                              disabled={busyAction === finishKey}
                            >
                              Mark Finished
                            </button>
                          )}
                          <button className="md-btn-secondary md-btn-small" type="button" onClick={() => openDetails(appointment)}>
                            View Details
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="md-section">
          <div className="md-section-header">
            <h2 className="md-section-title">Finished Jobs</h2>
            <span className="md-section-count">{finishedJobs.length}</span>
          </div>
          <div className="md-card">
            {finishedJobs.length === 0 ? (
              <div className="md-empty-state">No finished jobs yet.</div>
            ) : (
              <>
                <div className="md-table-wrap">
                  <table className="md-table">
                    <thead>
                      <tr>
                        <th>JOB ID</th>
                        <th>CLIENT</th>
                        <th>CONTACT</th>
                        <th>VEHICLE</th>
                        <th>PROBLEM</th>
                        <th>SCHEDULED</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finishedJobs.map((appointment) => {
                        const item = getDisplayAppointment(appointment);
                        return (
                          <tr key={`finished-${item.id}`}>
                            <td className="md-job-id">#{item.id}</td>
                            <td>{item.clientName}</td>
                            <td>{item.contactNumber}</td>
                            <td>{item.vehicle}</td>
                            <td>{item.issue}</td>
                            <td>{item.appointmentDate}</td>
                            <td>
                              <span className={`md-status-badge ${getStatusBadgeClass(item.status)}`}>
                                {formatStatus(item.status)}
                              </span>
                            </td>
                            <td>
                              <button className="md-btn-secondary md-btn-small" type="button" onClick={() => openDetails(appointment)}>
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md-job-cards">
                  {finishedJobs.map((appointment) => {
                    const item = getDisplayAppointment(appointment);
                    return (
                      <article className="md-job-card" key={`finished-card-${item.id}`}>
                        <div className="md-job-card-header">
                          <span className="md-job-id">#{item.id}</span>
                          <span className={`md-status-badge ${getStatusBadgeClass(item.status)}`}>{formatStatus(item.status)}</span>
                        </div>
                        <p><strong>Client:</strong> {item.clientName}</p>
                        <p><strong>Contact:</strong> {item.contactNumber}</p>
                        <p><strong>Vehicle:</strong> {item.vehicle}</p>
                        <p><strong>Problem:</strong> {item.issue}</p>
                        <p><strong>Scheduled:</strong> {item.appointmentDate}</p>
                        <button className="md-btn-secondary md-btn-small" type="button" onClick={() => openDetails(appointment)}>
                          View Details
                        </button>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <AppointmentDetailsPanel
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusUpdate={handleStatusUpdate}
        isAdmin={false}
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default MechanicDashboard;
