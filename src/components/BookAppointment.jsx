import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAppointment } from '../services/appointmentService';
import './BookAppointment.css';

const BookAppointment = ({ isOpen, onClose, onSuccess, vehicles = [] }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    serviceType: '',
    vehicleInfo: '',
    date: '',
    time: '',
    problemDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const closeTimerRef = useRef(null);

  // Vehicle validation helper
  const hasVehicles = vehicles && vehicles.length > 0;

  const serviceTypes = [
    'Oil Change',
    'Brake Service',
    'Engine Diagnostics',
    'Tire Service',
    'AC Repair',
    'Battery Replacement',
    'Transmission Service',
    'General Checkup',
    'Other',
  ];

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const resetBookingState = () => {
    setFormData({ serviceType: '', vehicleInfo: '', date: '', time: '', problemDescription: '' });
    setSubmitSuccess(false);
    setErrors({});
    setApiError('');
  };

  const finishBooking = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    resetBookingState();
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'Service type is required';
    }
    if (!formData.vehicleInfo.trim()) {
      newErrors.vehicleInfo = 'Vehicle is required';
    }
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time.trim()) {
      newErrors.time = 'Time is required';
    }
    if (!formData.problemDescription.trim()) {
      newErrors.problemDescription = 'Problem description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      // Combine date and time to create ISO-8601 format
      const scheduledDate = new Date(`${formData.date}T${formData.time}:00`).toISOString();

      await createAppointment(
        {
          serviceType: formData.serviceType,
          vehicleInfo: formData.vehicleInfo,
          problemDescription: formData.problemDescription,
          scheduledDate,
        },
        token
      );

      setSubmitSuccess(true);

      closeTimerRef.current = setTimeout(finishBooking, 2400);
    } catch (err) {
      setApiError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal when clicking backdrop
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="ba-overlay" onClick={handleOverlayClick}>
      <div className="ba-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ba-header">
          <button className="ba-back-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Dashboard
          </button>
          <div className="ba-header-content">
            <div className="ba-header-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h1 className="ba-title">Book an Appointment</h1>
              <p className="ba-subtitle">Schedule your vehicle service with our certified mechanics</p>
            </div>
          </div>
        </div>

        {submitSuccess ? (
          <div className="ba-success">
            <div className="ba-success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 className="ba-success-title">Appointment booked</h2>
            <p className="ba-success-message">
              Your request was submitted successfully. A mechanic will be assigned once the shop reviews the booking.
            </p>
            <button type="button" className="ba-btn ba-btn-primary ba-success-btn" onClick={finishBooking}>
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form className="ba-form" onSubmit={handleSubmit}>
            {apiError && (
              <div className="ba-error-alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {apiError}
              </div>
            )}

            {/* Service Type */}
            <div className="ba-form-group">
              <label className="ba-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                Service Type
              </label>
              <select
                name="serviceType"
                className={`ba-select ${errors.serviceType ? 'ba-input-error' : ''}`}
                value={formData.serviceType}
                onChange={handleChange}
                required
              >
                <option value="">Select service type...</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.serviceType && <span className="ba-error">{errors.serviceType}</span>}
            </div>

            {/* Vehicle Selection */}
            <div className="ba-form-group">
              <label className="ba-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                Vehicle Information
              </label>
              {hasVehicles ? (
                <select
                  name="vehicleInfo"
                  className={`ba-select ${errors.vehicleInfo ? 'ba-input-error' : ''}`}
                  value={formData.vehicleInfo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option
                      key={vehicle.id}
                      value={`${vehicle.make} ${vehicle.model} ${vehicle.year} - ${vehicle.plateNumber}`}
                    >
                      {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.plateNumber}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="vehicleInfo"
                  className={`ba-input ${errors.vehicleInfo ? 'ba-input-error' : ''}`}
                  placeholder="e.g., Honda Civic 2019 - ABC 1234"
                  value={formData.vehicleInfo}
                  onChange={handleChange}
                  required
                />
              )}
              {errors.vehicleInfo && <span className="ba-error">{errors.vehicleInfo}</span>}
              {!hasVehicles && (
                <span className="ba-hint">
                  💡 Tip: Register your vehicles in "Manage Vehicles" for quick selection
                </span>
              )}
            </div>

            {/* Date and Time Row */}
            <div className="ba-form-row">
              <div className="ba-form-group">
                <label className="ba-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  className={`ba-input ${errors.date ? 'ba-input-error' : ''}`}
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  required
                />
                {errors.date && <span className="ba-error">{errors.date}</span>}
              </div>

              <div className="ba-form-group">
                <label className="ba-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Preferred Time
                </label>
                <select
                  name="time"
                  className={`ba-select ${errors.time ? 'ba-input-error' : ''}`}
                  value={formData.time}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select time...</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
                {errors.time && <span className="ba-error">{errors.time}</span>}
              </div>
            </div>

            {/* Issue Description */}
            <div className="ba-form-group">
              <label className="ba-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Describe the Problem
              </label>
              <textarea
                name="problemDescription"
                className={`ba-textarea ${errors.problemDescription ? 'ba-input-error' : ''}`}
                placeholder="Tell us what's wrong with your vehicle (e.g., engine making a clicking sound, brakes squeaking, AC not cooling...)"
                value={formData.problemDescription}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
              {errors.problemDescription && <span className="ba-error">{errors.problemDescription}</span>}
              <span className="ba-hint">Be as detailed as possible to help our mechanics prepare.</span>
            </div>

            {/* Submit Button */}
            <div className="ba-form-actions">
              <button type="button" className="ba-btn ba-btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="ba-btn ba-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="ba-spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Submit Booking
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
