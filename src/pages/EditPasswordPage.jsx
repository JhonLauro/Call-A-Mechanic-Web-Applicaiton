import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updatePassword } from '../services/profileService';
import Snackbar from '../components/Snackbar';
import './ProfilePages.css';

const profileNavItems = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/edit', label: 'Edit Profile' },
  { to: '/profile/password', label: 'Edit Password' },
  { to: '/profile/photo', label: 'Upload Photo' },
];

const EditPasswordPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errors = {};

    if (!form.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }

    if (!form.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (form.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters.';
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updatePassword(
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        },
        token
      );
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="profile-title">Edit Password</h1>
          <p className="profile-subtitle">Use a strong password to secure your account.</p>
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
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="Current password"
                />
                {fieldErrors.currentPassword && (
                  <span className="field-error">{fieldErrors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                />
                {fieldErrors.newPassword && (
                  <span className="field-error">{fieldErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                />
                {fieldErrors.confirmPassword && (
                  <span className="field-error">{fieldErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="actions-row">
              <Link className="btn secondary" to="/profile">Back to Profile</Link>
              <button className="btn primary" type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>

            <Snackbar
              open={!!error}
              message={error}
              type="error"
              onClose={() => setError('')}
            />
            <Snackbar
              open={!!success}
              message={success}
              type="success"
              onClose={() => setSuccess('')}
            />
          </form>
        </section>
      </div>
    </div>
  );
};

export default EditPasswordPage;
