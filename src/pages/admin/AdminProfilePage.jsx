import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Snackbar from '../../components/Snackbar';
import { getProfile, updatePassword, updateProfile, uploadProfilePhoto } from '../../services/profileService';
import { getAllUsers } from '../../services/adminService';
import { getAppointments } from '../../services/appointmentService';
import LoadingScreen from '../../components/LoadingScreen';
import './AdminProfilePage.css';

const toInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const pickFirst = (...values) =>
  values.find((value) => value !== null && value !== undefined && String(value).trim() !== '');

const AdminProfilePage = () => {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const fallbackProfile = useMemo(() => ({
    fullName: user?.fullName || 'Admin',
    adminId: pickFirst(user?.adminId, user?.adminID, user?.accountIdentifier, user?.id, '-'),
    email: user?.email || '-',
    phoneNumber: user?.phoneNumber || '',
    role: user?.role || 'Admin',
    status: user?.isActive === false ? 'Inactive' : 'Active',
    dateCreated: user?.createdAt || user?.dateCreated || '-',
    lastUpdated: user?.updatedAt || user?.lastUpdated || '-',
    photoUrl: user?.photoUrl || user?.profilePhotoUrl || user?.avatarUrl || '',
  }), [user]);

  const [profile, setProfile] = useState({ ...fallbackProfile });

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalMechanics: 0,
    activeAppointments: 0,
  });

  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(!user);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: profile.fullName,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Feedback states
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const normalizeProfile = useCallback((data = {}) => ({
    fullName: data.fullName || fallbackProfile.fullName,
    adminId: pickFirst(data.adminId, data.adminID, data.accountIdentifier, fallbackProfile.adminId, data.id, '-'),
    email: data.email || fallbackProfile.email,
    phoneNumber: data.phoneNumber || fallbackProfile.phoneNumber,
    role: data.role || fallbackProfile.role,
    status: data.isActive === false ? 'Inactive' : 'Active',
    dateCreated: formatDate(data.createdAt || data.dateCreated || fallbackProfile.dateCreated),
    lastUpdated: formatDate(data.updatedAt || data.lastUpdated || fallbackProfile.lastUpdated),
    photoUrl: data.photoUrl || data.profilePhotoUrl || data.avatarUrl || fallbackProfile.photoUrl,
  }), [fallbackProfile]);

  const applyProfile = useCallback((nextProfile) => {
    setProfile(nextProfile);
    setProfileForm({
      fullName: nextProfile.fullName || '',
      email: nextProfile.email || '',
      phoneNumber: nextProfile.phoneNumber || '',
    });
  }, []);

  const loadAdminProfile = useCallback(async () => {
    if (!token) {
      applyProfile(fallbackProfile);
      setLoading(false);
      return;
    }

    if (!user) setLoading(true);
    try {
      const [profileData, usersData, appointmentsData] = await Promise.all([
        getProfile(token),
        getAllUsers(token),
        getAppointments(token),
      ]);

      const users = Array.isArray(usersData?.users) ? usersData.users : [];
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
      const activeStatuses = new Set(['PENDING', 'IN_PROGRESS']);

      applyProfile(normalizeProfile(profileData || {}));
      setAdminStats({
        totalUsers: users.length,
        totalMechanics: users.filter((item) => String(item.role || '').toUpperCase() === 'MECHANIC').length,
        activeAppointments: appointments.filter((appointment) =>
          activeStatuses.has(String(appointment.status || '').toUpperCase())
        ).length,
      });
    } catch (err) {
      applyProfile(normalizeProfile(user || {}));
      showSnackbar(err.message || 'Failed to load admin profile details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [applyProfile, fallbackProfile, normalizeProfile, token, user]);

  useEffect(() => {
    loadAdminProfile();
  }, [loadAdminProfile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Profile form handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!profileForm.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfileForm()) return;

    setSaving(true);
    try {
      const updated = await updateProfile(
        {
          fullName: profileForm.fullName.trim(),
          phoneNumber: profileForm.phoneNumber.trim(),
        },
        token
      );

      const nextProfile = normalizeProfile({ ...profile, ...updated, ...profileForm });
      applyProfile(nextProfile);
      updateUser(nextProfile);
      setIsEditingProfile(false);
      showSnackbar('Profile updated successfully!');
    } catch (err) {
      showSnackbar(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    });
    setErrors({});
    setIsEditingProfile(false);
  };

  // Password form handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSave = async () => {
    if (!validatePasswordForm()) return;

    setSaving(true);
    try {
      await updatePassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        token
      );

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      showSnackbar('Password changed successfully!');
    } catch (err) {
      showSnackbar(err.message || 'Failed to change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setIsChangingPassword(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select an image file.', 'error');
      return;
    }

    setSaving(true);
    try {
      const result = await uploadProfilePhoto(file, token);
      const nextPhotoUrl = result?.photoUrl || URL.createObjectURL(file);
      setProfile(prev => ({
        ...prev,
        photoUrl: nextPhotoUrl,
        lastUpdated: formatDate(new Date()),
      }));
      updateUser({ photoUrl: nextPhotoUrl, profilePhotoUrl: nextPhotoUrl, hasPhoto: true });
      showSnackbar('Photo updated successfully!');
    } catch (err) {
      showSnackbar(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-profile">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="admin-profile">
      {/* Header */}
      <header className="ap-header">
        <div className="ap-header-left">
          <button className="ap-back-btn" onClick={() => navigate('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Dashboard
          </button>
        </div>
        <div className="ap-header-right">
          <span className="ap-admin-badge">Admin</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="ap-main">
        {/* Page Header */}
        <div className="ap-page-header">
          <h1 className="ap-page-title">Admin Profile</h1>
          <p className="ap-page-subtitle">Manage your account details and security settings</p>
        </div>

        <div className="ap-layout">
          {/* Left Column */}
          <div className="ap-left-column">
            {/* Profile Overview Card */}
            <div className="ap-card ap-profile-card">
              <div className="ap-profile-avatar-wrapper">
                {profile.photoUrl ? (
                  <img className="ap-profile-avatar" src={profile.photoUrl} alt="Profile" />
                ) : (
                  <div className="ap-profile-avatar-placeholder">
                    {toInitials(profile.fullName)}
                  </div>
                )}
                <label className="ap-avatar-edit-btn">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </label>
              </div>
              <h2 className="ap-profile-name">{profile.fullName}</h2>
              <span className="ap-profile-id">{profile.adminId}</span>
              <div className="ap-profile-badges">
                <span className="ap-badge ap-badge-role">{profile.role}</span>
                <span className="ap-badge ap-badge-status">{profile.status}</span>
              </div>
              <button
                className="ap-edit-profile-btn"
                onClick={() => setIsEditingProfile(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>
            </div>

            {/* Admin Summary Card */}
            <div className="ap-card ap-summary-card">
              <h3 className="ap-card-title">Quick Overview</h3>
              <div className="ap-summary-stats">
                <div className="ap-summary-stat">
                  <span className="ap-summary-value">{adminStats.totalUsers}</span>
                  <span className="ap-summary-label">Total Users</span>
                </div>
                <div className="ap-summary-stat">
                  <span className="ap-summary-value">{adminStats.totalMechanics}</span>
                  <span className="ap-summary-label">Mechanics</span>
                </div>
                <div className="ap-summary-stat">
                  <span className="ap-summary-value">{adminStats.activeAppointments}</span>
                  <span className="ap-summary-label">Active Jobs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="ap-right-column">
            {/* Account Information Card */}
            <div className="ap-card">
              <div className="ap-card-header">
                <h3 className="ap-card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Account Information
                </h3>
              </div>

              {isEditingProfile ? (
                <div className="ap-form">
                  <div className="ap-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      placeholder="Enter full name"
                      className={errors.fullName ? 'ap-input-error' : ''}
                    />
                    {errors.fullName && <span className="ap-error">{errors.fullName}</span>}
                  </div>
                  <div className="ap-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      disabled
                      placeholder="Enter email"
                      className={errors.email ? 'ap-input-error' : ''}
                    />
                    {errors.email && <span className="ap-error">{errors.email}</span>}
                  </div>
                  <div className="ap-form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={handleProfileChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div className="ap-form-actions">
                    <button className="ap-btn ap-btn-secondary" onClick={handleProfileCancel}>
                      Cancel
                    </button>
                    <button className="ap-btn ap-btn-primary" onClick={handleProfileSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ap-info-grid">
                  <div className="ap-info-item">
                    <span className="ap-info-label">Full Name</span>
                    <span className="ap-info-value">{profile.fullName}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Admin ID</span>
                    <span className="ap-info-value">{profile.adminId}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Email Address</span>
                    <span className="ap-info-value">{profile.email}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Contact Number</span>
                    <span className="ap-info-value">{profile.phoneNumber || '-'}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Date Created</span>
                    <span className="ap-info-value">{profile.dateCreated}</span>
                  </div>
                  <div className="ap-info-item">
                    <span className="ap-info-label">Last Updated</span>
                    <span className="ap-info-value">{profile.lastUpdated}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Security Card */}
            <div className="ap-card">
              <div className="ap-card-header">
                <h3 className="ap-card-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Security
                </h3>
                {!isChangingPassword && (
                  <button className="ap-change-password-btn" onClick={() => setIsChangingPassword(true)}>
                    Change Password
                  </button>
                )}
              </div>

              {isChangingPassword ? (
                <div className="ap-form">
                  <div className="ap-form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className={errors.currentPassword ? 'ap-input-error' : ''}
                    />
                    {errors.currentPassword && <span className="ap-error">{errors.currentPassword}</span>}
                  </div>
                  <div className="ap-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className={errors.newPassword ? 'ap-input-error' : ''}
                    />
                    {errors.newPassword && <span className="ap-error">{errors.newPassword}</span>}
                  </div>
                  <div className="ap-form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className={errors.confirmPassword ? 'ap-input-error' : ''}
                    />
                    {errors.confirmPassword && <span className="ap-error">{errors.confirmPassword}</span>}
                  </div>
                  <div className="ap-form-actions">
                    <button className="ap-btn ap-btn-secondary" onClick={handlePasswordCancel}>
                      Cancel
                    </button>
                    <button className="ap-btn ap-btn-primary" onClick={handlePasswordSave} disabled={saving}>
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ap-security-info">
                  <div className="ap-security-item">
                    <div className="ap-security-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div className="ap-security-text">
                      <span className="ap-security-label">Password</span>
                      <span className="ap-security-value">••••••••</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <div className="ap-logout-section">
                <button className="ap-logout-btn" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default AdminProfilePage;
