import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, updatePassword, uploadProfilePhoto } from '../../services/profileService';
import { getVehicles } from '../../services/vehicleService';
import VehicleManagement from '../../components/VehicleManagement';
import Snackbar from '../../components/Snackbar';
import LoadingScreen from '../../components/LoadingScreen';
import './ProfilePages.css';

const toInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const pickFirst = (...values) =>
  values.find((value) => value !== null && value !== undefined && String(value).trim() !== '');

const ProfilePage = () => {
  const { token, user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(!user);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showVehicleManagement, setShowVehicleManagement] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({ fullName: '', phoneNumber: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });

  const normalizedRole = String(profile?.role || user?.role || '').toUpperCase();
  const canManageVehicles = normalizedRole === 'CLIENT';
  const accountId =
    normalizedRole === 'MECHANIC'
      ? pickFirst(
          profile?.mechanicId,
          profile?.mechanicID,
          profile?.mechanic?.mechanicId,
          profile?.accountIdentifier,
          user?.mechanicId,
          user?.mechanicID,
          user?.accountIdentifier,
          profile?.id,
          profile?._id,
          '-'
        )
      : normalizedRole === 'ADMIN'
        ? pickFirst(
            profile?.adminId,
            profile?.adminID,
            profile?.accountIdentifier,
            user?.adminId,
            user?.adminID,
            user?.accountIdentifier,
            profile?.id,
            profile?._id,
            '-'
          )
        : pickFirst(profile?.clientId, profile?.clientID, profile?.id, profile?._id, user?.id, '-');

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getProfile(token);
        if (isMounted) {
          const nextProfile = data ? { ...(user || {}), ...data } : user || null;
          setProfile(nextProfile);
          setProfileForm({
            fullName: nextProfile?.fullName || '',
            phoneNumber: nextProfile?.phoneNumber || '',
          });
        }
      } catch {
        if (isMounted) setProfile(user || null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [token, user]);

  useEffect(() => {
    let isMounted = true;

    const loadVehicles = async () => {
      if (!token || !canManageVehicles) {
        setVehicles([]);
        return;
      }

      setVehiclesLoading(true);
      try {
        const data = await getVehicles(token);
        if (isMounted) setVehicles(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) {
          setVehicles([]);
          showSnackbar(err.message || 'Failed to load vehicles.', 'error');
        }
      } finally {
        if (isMounted) setVehiclesLoading(false);
      }
    };

    loadVehicles();
    return () => { isMounted = false; };
  }, [token, canManageVehicles]);

  const photoSrc = useMemo(
    () => profile?.photoUrl || profile?.profilePhotoUrl || profile?.avatarUrl || '',
    [profile]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileSave = async () => {
    if (!profileForm.fullName.trim()) {
      showSnackbar('Full name is required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ fullName: profileForm.fullName.trim(), phoneNumber: profileForm.phoneNumber.trim() }, token);
      setProfile(prev => ({ ...prev, fullName: profileForm.fullName, phoneNumber: profileForm.phoneNumber }));
      updateUser({ fullName: profileForm.fullName, phoneNumber: profileForm.phoneNumber });
      setIsEditingProfile(false);
      showSnackbar('Profile updated successfully!');
    } catch (err) {
      showSnackbar(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showSnackbar('Please fill in all password fields.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showSnackbar('Password must be at least 8 characters.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }, token);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      showSnackbar('Password changed successfully!');
    } catch (err) {
      showSnackbar(err.message || 'Failed to change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
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
      setProfile(prev => ({ ...prev, photoUrl: nextPhotoUrl, hasPhoto: true }));
      updateUser({ photoUrl: nextPhotoUrl, profilePhotoUrl: nextPhotoUrl, hasPhoto: true });
      showSnackbar('Photo uploaded successfully!');
    } catch (err) {
      showSnackbar(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pp-container">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="pp-container">
      <header className="pp-header">
        <button className="pp-back-btn" onClick={() => navigate('/dashboard')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Dashboard
        </button>
        <button className="pp-logout-btn" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </header>

      <div className="pp-layout">
        <aside className="pp-sidebar">
          <div className="pp-sidebar-card">
            <div className="pp-sidebar-avatar-wrapper">
              {photoSrc ? (
                <img className="pp-sidebar-avatar" src={photoSrc} alt="Profile" />
              ) : (
                <div className="pp-sidebar-avatar-placeholder">
                  {toInitials(profile?.fullName || user?.fullName || '')}
                </div>
              )}
              <label className="pp-sidebar-avatar-edit">
                <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </label>
            </div>

            <h2 className="pp-sidebar-name">{profile?.fullName || 'No name set'}</h2>
            <span className="pp-sidebar-role">{profile?.role || 'User'}</span>

            <div className="pp-sidebar-info">
              <div className="pp-sidebar-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{profile?.email || '-'}</span>
              </div>
              <div className="pp-sidebar-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{profile?.phoneNumber || '-'}</span>
              </div>
              <div className="pp-sidebar-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span>ID: {accountId}</span>
              </div>
            </div>

            <button className="pp-sidebar-btn" onClick={() => setIsEditingProfile(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Edit Settings
            </button>
          </div>
        </aside>

        <main className="pp-main">
          <div className="pp-main-header">
            <h1 className="pp-title">My Profile</h1>
            <p className="pp-subtitle">Manage your account settings and preferences</p>
          </div>

          <div className="pp-card">
            <div className="pp-card-header">
              <h3 className="pp-card-title">Personal Information</h3>
              {!isEditingProfile && (
                <button className="pp-edit-btn" onClick={() => setIsEditingProfile(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <div className="pp-form">
                <div className="pp-form-row">
                  <div className="pp-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="pp-form-group">
                    <label>Email Address</label>
                    <input type="email" value={profile?.email || ''} disabled />
                  </div>
                  <div className="pp-form-group">
                    <label>Contact Number</label>
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                <div className="pp-form-actions">
                  <button className="pp-btn pp-btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                  <button className="pp-btn pp-btn-primary" onClick={handleProfileSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pp-info-grid">
                <div className="pp-info-item">
                  <span className="pp-info-label">Full Name</span>
                  <span className="pp-info-value">{profile?.fullName || '-'}</span>
                </div>
                <div className="pp-info-item">
                  <span className="pp-info-label">Email Address</span>
                  <span className="pp-info-value">{profile?.email || '-'}</span>
                </div>
                <div className="pp-info-item">
                  <span className="pp-info-label">Contact Number</span>
                  <span className="pp-info-value">{profile?.phoneNumber || '-'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pp-card">
            <div className="pp-card-header">
              <h3 className="pp-card-title">Account Information</h3>
              {!isChangingPassword && (
                <button className="pp-edit-btn" onClick={() => setIsChangingPassword(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <div className="pp-form">
                <div className="pp-form-row">
                  <div className="pp-form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="pp-form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="pp-form-group">
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <div className="pp-form-actions">
                  <button className="pp-btn pp-btn-secondary" onClick={() => { setIsChangingPassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>Cancel</button>
                  <button className="pp-btn pp-btn-primary" onClick={handlePasswordSave} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="pp-info-grid">
                <div className="pp-info-item">
                  <span className="pp-info-label">User ID</span>
                  <span className="pp-info-value">{accountId}</span>
                </div>
                <div className="pp-info-item">
                  <span className="pp-info-label">Account Type</span>
                  <span className="pp-info-value">{profile?.role || 'User'}</span>
                </div>
                <div className="pp-info-item">
                  <span className="pp-info-label">Account Status</span>
                  <span className="pp-info-value">
                    <span className="pp-status-badge pp-status-active">Active</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {canManageVehicles && (
            <div className="pp-card">
              <div className="pp-card-header">
                <div className="pp-vehicles-title-group">
                  <p className="pp-vehicles-kicker">Garage</p>
                  <h3 className="pp-card-title">My Vehicles</h3>
                </div>
                <button className="pp-edit-btn" onClick={() => setShowVehicleManagement(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Vehicle
                </button>
              </div>

              {vehiclesLoading ? (
                <div className="pp-vehicles-empty">
                  <LoadingScreen compact />
                </div>
              ) : vehicles.length > 0 ? (
                <div className="pp-vehicles-list">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="pp-vehicle-card">
                      <div className="pp-vehicle-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13" rx="2"/>
                          <path d="M16 8h4l3 3v5h-7V8z"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                      </div>
                      <div className="pp-vehicle-details">
                        <h4 className="pp-vehicle-name">{vehicle.make} {vehicle.model}</h4>
                        <div className="pp-vehicle-meta">
                          <span>{vehicle.year}</span>
                          {vehicle.color && (
                            <>
                              <span className="pp-vehicle-separator">•</span>
                              <span>{vehicle.color}</span>
                            </>
                          )}
                          {vehicle.type && (
                            <>
                              <span className="pp-vehicle-separator">•</span>
                              <span>{vehicle.type}</span>
                            </>
                          )}
                        </div>
                        <p className="pp-vehicle-summary">
                          Plate: {vehicle.plateNumber || 'N/A'}
                          <span className="pp-vehicle-separator">•</span>
                          Recall: {vehicle.recallStatus || 'No Recall'}
                        </p>
                      </div>
                      <button className="pp-vehicle-action" onClick={() => setShowVehicleManagement(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pp-vehicles-empty">
                  <div className="pp-vehicles-empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="2"/>
                      <path d="M16 8h4l3 3v5h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                  <p className="pp-vehicles-empty-text">No vehicles registered yet</p>
                  <button className="pp-btn pp-btn-primary" onClick={() => setShowVehicleManagement(true)}>
                    Register Your First Vehicle
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <VehicleManagement
        isOpen={showVehicleManagement}
        onClose={() => setShowVehicleManagement(false)}
        onVehicleChange={(updatedVehicles) => setVehicles(updatedVehicles)}
      />

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ProfilePage;
