import React, { useState } from 'react';
import './AppointmentDetailsPanel.css';

const AppointmentDetailsPanel = ({
  appointment,
  onClose,
  onStatusUpdate,
  onAssignMechanic,
  mechanics = [],
  isAdmin = false
}) => {
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [isMechanicMenuOpen, setIsMechanicMenuOpen] = useState(false);

  if (!appointment) return null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'adp-status-pending';
      case 'IN_PROGRESS': return 'adp-status-progress';
      case 'FINISHED':
      case 'COMPLETED': return 'adp-status-finished';
      case 'CANCELLED': return 'adp-status-cancelled';
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAssignMechanic = () => {
    if (selectedMechanic && onAssignMechanic) {
      onAssignMechanic(appointment.id, parseInt(selectedMechanic));
      setSelectedMechanic('');
      setIsMechanicMenuOpen(false);
    }
  };

  const selectedMechanicInfo = mechanics.find(
    (mechanic) => String(mechanic.id) === String(selectedMechanic)
  );

  return (
    <div className="adp-overlay" onClick={handleOverlayClick}>
      <div className="adp-panel">
        {/* Header */}
        <div className="adp-header">
          <div className="adp-header-top">
            <button className="adp-close-btn" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="adp-header-content">
            <div className="adp-job-badge">{appointment.id}</div>
            <h2 className="adp-title">Appointment Details</h2>
            <span className={`adp-current-status ${getStatusBadgeClass(appointment.status)}`}>
              {formatStatus(appointment.status)}
            </span>
          </div>
          <div className="adp-summary-strip" aria-label="Appointment summary">
            <div className="adp-summary-card">
              <span className="adp-summary-label">Service</span>
              <strong>{appointment.serviceType || 'Service request'}</strong>
            </div>
            <div className="adp-summary-card">
              <span className="adp-summary-label">Schedule</span>
              <strong>{appointment.appointmentDate || 'Not scheduled'}</strong>
            </div>
            <div className="adp-summary-card">
              <span className="adp-summary-label">Mechanic</span>
              <strong>{appointment.mechanic || 'Unassigned'}</strong>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="adp-content">
          {/* Client Information */}
          <div className="adp-section">
            <h3 className="adp-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Client Information
            </h3>
            <div className="adp-info-grid">
              <div className="adp-info-item">
                <span className="adp-info-label">Client Name</span>
                <span className="adp-info-value">{appointment.clientName}</span>
              </div>
              <div className="adp-info-item">
                <span className="adp-info-label">Contact Number</span>
                <span className="adp-info-value">{appointment.contactNumber}</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Service */}
          <div className="adp-section">
            <h3 className="adp-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              Vehicle & Service
            </h3>
            <div className="adp-info-grid">
              <div className="adp-info-item">
                <span className="adp-info-label">Vehicle</span>
                <span className="adp-info-value">{appointment.vehicle}</span>
              </div>
              <div className="adp-info-item">
                <span className="adp-info-label">Appointment Date</span>
                <span className="adp-info-value">{appointment.appointmentDate}</span>
              </div>
            </div>
            <div className="adp-info-item adp-info-full">
              <span className="adp-info-label">Car Issue / Service Request</span>
              <span className="adp-info-value adp-issue">{appointment.carIssue}</span>
            </div>
          </div>

          {/* Assignment */}
          <div className="adp-section">
            <h3 className="adp-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              Assignment
            </h3>
            <div className="adp-info-item">
              <span className="adp-info-label">Assigned Mechanic</span>
              <span className={`adp-info-value ${appointment.mechanic === 'Unassigned' ? 'adp-unassigned' : ''}`}>
                {appointment.mechanic}
              </span>
            </div>

            {isAdmin && (
              <div className="adp-assign-mechanic">
                <label className="adp-assign-label">
                  {appointment.mechanic === 'Unassigned' ? 'Assign Mechanic' : 'Reassign Mechanic'}
                </label>
                <div className="adp-assign-row">
                  <div className="adp-mechanic-dropdown">
                    <button
                      type="button"
                      className={`adp-mechanic-trigger ${isMechanicMenuOpen ? 'adp-open' : ''}`}
                      onClick={() => setIsMechanicMenuOpen((open) => !open)}
                    >
                      <span className={selectedMechanicInfo ? 'adp-selected-mechanic' : 'adp-placeholder'}>
                        {selectedMechanicInfo
                          ? `${selectedMechanicInfo.fullName} (${selectedMechanicInfo.mechanicId})`
                          : 'Select a mechanic...'}
                      </span>
                      <svg className="adp-chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isMechanicMenuOpen && (
                      <div className="adp-mechanic-menu">
                        {mechanics.length === 0 ? (
                          <div className="adp-mechanic-empty">No mechanics available</div>
                        ) : (
                          mechanics.map((mechanic) => (
                            <button
                              type="button"
                              key={mechanic.id}
                              className={`adp-mechanic-option ${String(selectedMechanic) === String(mechanic.id) ? 'adp-selected' : ''}`}
                              onClick={() => {
                                setSelectedMechanic(String(mechanic.id));
                                setIsMechanicMenuOpen(false);
                              }}
                            >
                              <span className="adp-mechanic-avatar">
                                {mechanic.fullName?.charAt(0)?.toUpperCase() || 'M'}
                              </span>
                              <span className="adp-mechanic-option-text">
                                <span className="adp-mechanic-name">{mechanic.fullName}</span>
                                <span className="adp-mechanic-id">{mechanic.mechanicId}</span>
                              </span>
                              {String(selectedMechanic) === String(mechanic.id) && (
                                <svg className="adp-option-check" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="adp-assign-btn"
                    onClick={handleAssignMechanic}
                    disabled={!selectedMechanic}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Actions */}
          <div className="adp-section">
            <h3 className="adp-section-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Update Status
            </h3>
            <div className="adp-status-actions">
              <button
                className={`adp-status-btn adp-status-btn-pending ${appointment.status === 'PENDING' ? 'adp-active' : ''}`}
                onClick={() => onStatusUpdate(appointment.id, 'PENDING')}
                disabled={appointment.status === 'PENDING'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                Mark as Pending
              </button>
              <button
                className={`adp-status-btn adp-status-btn-progress ${appointment.status === 'IN_PROGRESS' ? 'adp-active' : ''}`}
                onClick={() => onStatusUpdate(appointment.id, 'IN_PROGRESS')}
                disabled={appointment.status === 'IN_PROGRESS'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                Mark as In Progress
              </button>
              <button
                className={`adp-status-btn adp-status-btn-finished ${appointment.status === 'FINISHED' ? 'adp-active' : ''}`}
                onClick={() => onStatusUpdate(appointment.id, 'FINISHED')}
                disabled={appointment.status === 'FINISHED'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Mark as Finished
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="adp-footer">
          <button className="adp-btn adp-btn-secondary" onClick={onClose}>
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsPanel;
