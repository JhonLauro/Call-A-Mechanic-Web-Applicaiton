import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Snackbar from '../../components/Snackbar';
import './AuthPages.css';

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone) =>
  /^\+?[\d\s\-().]{7,20}$/.test(phone);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }
    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!form.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required.';
    } else if (!validatePhone(form.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number.';
    }
    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
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
      const { confirmPassword, ...payload } = form;
      payload.fullName = payload.fullName.trim();
      payload.email = payload.email.trim();
      payload.phoneNumber = payload.phoneNumber.trim();
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.';
      if (message === 'Email already exists.' || message.toLowerCase().includes('email already')) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'This email is already registered. Use another email or sign in.',
        }));
      } else if (err.message === 'Failed to fetch') {
        setApiError('Unable to reach the server. Please check your connection.');
      } else {
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="back-home-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </Link>

      {/* ── Left branding panel ── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Join<br /><span>Call-A-Mechanic</span></h1>
          <p>Create your account and get access to certified mechanics ready to help you on the road.</p>
          <div className="auth-left-features">
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon icon-speed">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              Fast response from certified mechanics
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon icon-location">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/>
                </svg>
              </div>
              Real-time location tracking
            </div>
            <div className="auth-left-feature">
              <div className="auth-left-feature-icon icon-security">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              Secure and verified service providers
            </div>
          </div>
        </div>
      </div>

      {/* ── Decorative Divider ── */}
      <div className="auth-divider">
        <div className="auth-divider-line">
          <div className="auth-divider-glow"></div>
        </div>
        <div className="auth-divider-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <div className="auth-divider-line">
          <div className="auth-divider-glow"></div>
        </div>
        <div className="auth-divider-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-form-box auth-form-box--wide">
          <div className="auth-form-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="auth-brand">Call-A-Mechanic</p>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Fill in the details below to register</p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                className={fieldErrors.fullName ? 'input-error' : ''}
                placeholder="e.g. John Cena"
              />
              {fieldErrors.fullName && (
                <span className="field-error">{fieldErrors.fullName}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={fieldErrors.email ? 'input-error' : ''}
                placeholder="e.g. john@email.com"
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                className={fieldErrors.phoneNumber ? 'input-error' : ''}
                placeholder="e.g. 63+ 9123456789"
              />
              {fieldErrors.phoneNumber && (
                <span className="field-error">{fieldErrors.phoneNumber}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? 'input-error' : ''}
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.confirmPassword ? 'input-error' : ''}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
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
              {fieldErrors.confirmPassword && (
                <span className="field-error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
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

export default RegisterPage;
