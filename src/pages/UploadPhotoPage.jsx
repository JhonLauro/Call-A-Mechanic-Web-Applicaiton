import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadProfilePhoto } from '../services/profileService';
import Snackbar from '../components/Snackbar';
import './ProfilePages.css';

const profileNavItems = [
  { to: '/profile', label: 'Profile' },
  { to: '/profile/edit', label: 'Edit Profile' },
  { to: '/profile/password', label: 'Edit Password' },
  { to: '/profile/photo', label: 'Upload Photo' },
];

const allowedTypes = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const UploadPhotoPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  const [previewSrc, setPreviewSrc] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewSrc('');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    setError('');
    setSuccess('');

    if (!selected) {
      setFile(null);
      return;
    }

    if (!allowedTypes.includes(selected.type)) {
      setError('Only .jpg and .png files are supported.');
      setFile(null);
      return;
    }

    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setError('Image must be 5MB or smaller.');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('Please choose an image first.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const result = await uploadProfilePhoto(file, token);
      setSuccess(result?.message || 'Photo uploaded successfully.');

      // Navigate to profile page after 1 second to show the success message
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
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
          <h1 className="profile-title">Upload Photo</h1>
          <p className="profile-subtitle">Upload a .jpg or .png profile image.</p>
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
            <div className="upload-box">
              <div className="form-group full">
                <label htmlFor="photo">Select Image (.jpg, .png)</label>
                <input id="photo" type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
                {file && (
                  <div className="upload-meta">
                    Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                  </div>
                )}
              </div>

              {previewSrc && (
                <div className="profile-photo-block" style={{ marginTop: '14px' }}>
                  <img className="profile-photo" src={previewSrc} alt="Preview" />
                  <div className="profile-photo-meta">Preview before upload</div>
                </div>
              )}
            </div>

            <div className="actions-row">
              <Link className="btn secondary" to="/profile">Back to Profile</Link>
              <button className="btn primary" type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Photo'}
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

export default UploadPhotoPage;
