import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/profileService';
import './ProfilePages.css';

const profileNavItems = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/edit', label: 'Edit Profile' },
  { to: '/profile/password', label: 'Edit Password' },
  { to: '/profile/photo', label: 'Upload Photo' },
];

const toInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

const ProfilePage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setProfile(data || user || null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load profile.');
          setProfile(user || null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const photoSrc = useMemo(
    () =>
      profile?.photoUrl ||
      profile?.profilePhotoUrl ||
      profile?.avatarUrl ||
      profile?.imageUrl ||
      '',
    [profile]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-layout">
      <header className="profile-topbar">
        <div className="profile-brand">Call-A-Mechanic</div>
        <div className="profile-top-actions">
          <Link className="btn secondary" to="/dashboard">Dashboard</Link>
          <button className="btn danger" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="profile-page">
        <div className="profile-header">
          <h1 className="profile-title">My Account</h1>
          <p className="profile-subtitle">
            Manage your personal details, password, and profile photo.
          </p>
        </div>

        <nav className="profile-tabs" aria-label="Profile pages">
          {profileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `profile-tab${isActive ? ' active' : ''}`
              }
              end={item.to === '/profile'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <section className="profile-card">
          {loading && <p className="loading-note">Loading your profile...</p>}

          {!loading && error && (
            <div className="status-banner error" role="alert">
              {error}
            </div>
          )}

          {!loading && (
            <>
              <div className="profile-photo-block">
                {photoSrc ? (
                  <img className="profile-photo" src={photoSrc} alt="Profile" />
                ) : (
                  <div className="profile-photo-placeholder">
                    {toInitials(profile?.fullName || user?.fullName || '')}
                  </div>
                )}
                <div className="profile-photo-meta">
                  <div><strong>{profile?.fullName || user?.fullName || 'No name set'}</strong></div>
                  <div>{profile?.role || user?.role || 'User'}</div>
                </div>
              </div>

              <div className="profile-grid">
                <div className="profile-field">
                  <div className="profile-field-label">Full Name</div>
                  <div className="profile-field-value">{profile?.fullName || '-'}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">Email</div>
                  <div className="profile-field-value">{profile?.email || '-'}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">Phone Number</div>
                  <div className="profile-field-value">{profile?.phoneNumber || '-'}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">User ID</div>
                  <div className="profile-field-value">
                    {profile?.id || profile?.userId || profile?.mechanicId || '-'}
                  </div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">Photo Status</div>
                  <div className="profile-field-value">
                    {profile?.hasPhoto ? 'Photo uploaded' : 'No photo uploaded'}
                  </div>
                </div>
              </div>

              <div className="actions-row">
                <Link className="btn secondary" to="/profile/edit">Edit Profile</Link>
                <Link className="btn secondary" to="/profile/password">Change Password</Link>
                <Link className="btn primary" to="/profile/photo">Upload Photo</Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
