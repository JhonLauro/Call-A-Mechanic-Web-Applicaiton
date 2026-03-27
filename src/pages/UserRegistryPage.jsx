import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, deleteUser } from '../services/adminService';
import Snackbar from '../components/Snackbar';
import './UserRegistryPage.css';

const UserRegistryPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const showMessage = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // Load users
  const loadUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await getAllUsers(token);
      setUsers(data.users || []);
    } catch (err) {
      showMessage(err.message || 'Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const userName = user?.fullName || 'Admin';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Filter users
  const filteredUsers = users.filter(usr => {
    const matchesSearch =
      usr.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usr.mechanicId && usr.mechanicId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || usr.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Stats
  const totalUsers = users.length;
  const mechanics = users.filter(u => u.role === 'MECHANIC');
  const clients = users.filter(u => u.role === 'CLIENT');
  const activeUsers = users.filter(u => u.isActive).length;

  const handleDeleteClick = (usr) => {
    setSelectedUser(usr);
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText === selectedUser.fullName) {
      try {
        await deleteUser(selectedUser.id, token);
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        setShowDeleteModal(false);
        setSelectedUser(null);
        setDeleteConfirmText('');
        showMessage('User deleted successfully!');
      } catch (err) {
        showMessage(err.message || 'Failed to delete user.', 'error');
      }
    }
  };

  return (
    <div className="user-registry">
      {/* Header */}
      <header className="ur-header">
        <div className="ur-header-left">
          <button className="ur-back-btn" onClick={() => navigate('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>
        <div className="ur-header-right">
          <span className="ur-admin-badge">Admin</span>
          <div className="ur-user-avatar">{userInitials}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ur-main">
        {/* Page Header */}
        <div className="ur-page-header">
          <div className="ur-page-header-left">
            <h1 className="ur-page-title">User Registry</h1>
            <p className="ur-page-subtitle">Manage mechanic accounts and access</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="ur-stats-grid">
          <div className="ur-stat-card">
            <div className="ur-stat-icon ur-stat-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="ur-stat-content">
              <span className="ur-stat-label">Total Users</span>
              <span className="ur-stat-value">{totalUsers}</span>
            </div>
          </div>

          <div className="ur-stat-card">
            <div className="ur-stat-icon ur-stat-icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div className="ur-stat-content">
              <span className="ur-stat-label">Mechanics</span>
              <span className="ur-stat-value">{mechanics.length}</span>
            </div>
          </div>

          <div className="ur-stat-card">
            <div className="ur-stat-icon ur-stat-icon-green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="ur-stat-content">
              <span className="ur-stat-label">Clients</span>
              <span className="ur-stat-value">{clients.length}</span>
            </div>
          </div>

          <div className="ur-stat-card">
            <div className="ur-stat-icon ur-stat-icon-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="ur-stat-content">
              <span className="ur-stat-label">Active</span>
              <span className="ur-stat-value">{activeUsers}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ur-section">
          <div className="ur-section-header">
            <h2 className="ur-section-title">User Accounts</h2>
            <span className="ur-section-count">{filteredUsers.length} users</span>
          </div>

          <div className="ur-filters">
            <div className="ur-search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or mechanic ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ur-search-input"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="ur-filter-select"
            >
              <option value="ALL">All Roles</option>
              <option value="CLIENT">Clients</option>
              <option value="MECHANIC">Mechanics</option>
            </select>
          </div>

          {/* Table */}
          <div className="ur-table-container">
            <table className="ur-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>CONTACT</th>
                  <th>ROLE</th>
                  <th>MECHANIC ID</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((usr) => (
                    <tr key={usr.id}>
                      <td className="ur-table-id">#{usr.id}</td>
                      <td className="ur-table-name">{usr.fullName}</td>
                      <td>{usr.email}</td>
                      <td>{usr.phoneNumber || '-'}</td>
                      <td>
                        <span className={`ur-role-badge ur-role-${usr.role.toLowerCase()}`}>
                          {usr.role}
                        </span>
                      </td>
                      <td>{usr.mechanicId || '-'}</td>
                      <td>
                        <span className={`ur-table-status ${usr.isActive ? 'ur-status-active' : 'ur-status-inactive'}`}>
                          {usr.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="ur-action-btns">
                          <button
                            className="ur-action-btn ur-action-delete"
                            onClick={() => handleDeleteClick(usr)}
                            title="Delete Account"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No users found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="ur-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="ur-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ur-modal-header">
              <div className="ur-modal-icon ur-modal-icon-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="ur-modal-title">Delete User Account</h3>
              <p className="ur-modal-subtitle">
                This action cannot be undone. This will permanently delete the account for <strong>{selectedUser.fullName}</strong>.
              </p>
            </div>

            <div className="ur-modal-body">
              <div className="ur-delete-info">
                <div className="ur-delete-info-row">
                  <span className="ur-delete-label">User ID:</span>
                  <span className="ur-delete-value">#{selectedUser.id}</span>
                </div>
                <div className="ur-delete-info-row">
                  <span className="ur-delete-label">Email:</span>
                  <span className="ur-delete-value">{selectedUser.email}</span>
                </div>
                <div className="ur-delete-info-row">
                  <span className="ur-delete-label">Role:</span>
                  <span className="ur-delete-value">{selectedUser.role}</span>
                </div>
              </div>

              <div className="ur-confirm-input-wrapper">
                <label>Type <strong>{selectedUser.fullName}</strong> to confirm:</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Enter user's full name"
                  className="ur-confirm-input"
                />
              </div>
            </div>

            <div className="ur-modal-actions">
              <button className="ur-btn ur-btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                className="ur-btn ur-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText !== selectedUser.fullName}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

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

export default UserRegistryPage;
