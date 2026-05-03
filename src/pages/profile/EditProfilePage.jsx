import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../services/profileService';
import Snackbar from '../../components/Snackbar';
import LoadingScreen from '../../components/LoadingScreen';
import './ProfilePages.css';

const profileNavItems = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/edit', label: 'Edit Profile' },
  { to: '/profile/password', label: 'Edit Password' },
  { to: '/profile/photo', label: 'Upload Photo' },
];

const EditProfilePage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getProfile(token);
        if (!isMounted) return;
        setForm({
          fullName: data?.fullName || '',
          phoneNumber: data?.phoneNumber || '',
        });
        setEmail(data?.email || '');
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load profile details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const validate = () => {
    const errors = {};

    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
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
      const payload = {
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
      };
      await updateProfile(payload, token);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to save profile changes.');
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
          <h1 className="profile-title">Edit Profile</h1>
          <p className="profile-subtitle">Keep your account information up to date.</p>
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
          {loading && <LoadingScreen compact />}

          {!loading && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                  {fieldErrors.fullName && (
                    <span className="field-error">{fieldErrors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    disabled
                    placeholder="Email from account"
                  />
                </div>

                <div className="form-group full">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="+1 555 000 0000"
                  />
                  {fieldErrors.phoneNumber && (
                    <span className="field-error">{fieldErrors.phoneNumber}</span>
                  )}
                </div>
              </div>

              <div className="actions-row">
                <Link className="btn secondary" to="/profile">Cancel</Link>
                <button className="btn primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
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
          )}
        </section>
      </div>
    </div>
  );
};

export default EditProfilePage;
