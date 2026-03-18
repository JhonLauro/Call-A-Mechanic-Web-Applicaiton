import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Snackbar from '../components/Snackbar';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errors = {};
    if (!form.identifier.trim()) {
      errors.identifier = 'Email or ID is required.';
    }
    if (!form.password) {
      errors.password = 'Password is required.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await login(form.identifier.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setApiError('Unable to reach the server. Please check your connection.');
      } else {
        setApiError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left branding panel ── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">🔧</div>
          <h1>Welcome to<br /><span>Call-A-Mechanic</span></h1>
          <p>Your trusted roadside assistance platform. Get expert help wherever you are, whenever you need it.</p>
          <div className="auth-left-features">
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">⚡</div>
              Fast response from certified mechanics
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">📍</div>
              Real-time location tracking
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon">🛡️</div>
              Secure and verified service providers
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-form-box">
          <p className="auth-brand">Call-A-Mechanic</p>
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="identifier">Email / Mechanic ID / Admin ID</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={form.identifier}
                onChange={handleChange}
                className={fieldErrors.identifier ? 'input-error' : ''}
                placeholder="e.g. you@email.com or 01-001"
              />
              {fieldErrors.identifier && (
                <span className="field-error">{fieldErrors.identifier}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? 'input-error' : ''}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>

          <Snackbar
            open={!!apiError}
            message={apiError}
            type="error"
            onClose={() => setApiError('')}
          />
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
