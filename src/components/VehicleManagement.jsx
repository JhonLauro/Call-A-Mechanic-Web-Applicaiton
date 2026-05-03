import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVehicles, createVehicle, deleteVehicle } from '../services/vehicleService';
import LoadingScreen from './LoadingScreen';
import './VehicleManagement.css';

const VehicleManagement = ({ isOpen, onClose, onVehicleChange }) => {
  const { token } = useAuth();
  const onVehicleChangeRef = useRef(onVehicleChange);
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    plateNumber: '',
    color: '',
    type: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    onVehicleChangeRef.current = onVehicleChange;
  }, [onVehicleChange]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const data = await getVehicles(token);
      setVehicles(data || []);
      if (onVehicleChangeRef.current) onVehicleChangeRef.current(data || []);
    } catch (error) {
      setApiError(error.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load vehicles from API
  useEffect(() => {
    if (isOpen && token) {
      loadVehicles();
    }
  }, [isOpen, token, loadVehicles]);

  if (!isOpen) return null;

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
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (!/^\d{4}$/.test(formData.year)) {
      newErrors.year = 'Year must be a valid 4-digit year';
    }
    if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
    if (!formData.color.trim()) newErrors.color = 'Color is required';
    if (!formData.type) newErrors.type = 'Vehicle type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const newVehicle = await createVehicle(formData, token);
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      if (onVehicleChange) onVehicleChange(updatedVehicles);

      // Reset form
      setFormData({
        make: '',
        model: '',
        year: '',
        plateNumber: '',
        color: '',
        type: '',
        notes: '',
      });
      setShowAddForm(false);
    } catch (error) {
      setApiError(error.message || 'Failed to create vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await deleteVehicle(vehicleId, token);
      const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);
      setVehicles(updatedVehicles);
      if (onVehicleChange) onVehicleChange(updatedVehicles);
    } catch (error) {
      setApiError(error.message || 'Failed to delete vehicle. Please try again.');
    }
  };

  // Close modal when clicking backdrop
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="vm-overlay" onClick={handleOverlayClick}>
      <div className="vm-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vm-header">
          <button className="vm-back-btn" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Dashboard
          </button>
          <h1 className="vm-title">My Vehicles</h1>
          <p className="vm-subtitle">Manage your registered vehicles</p>
        </div>

        {/* Content */}
        <div className="vm-content">
          {/* API Error Alert */}
          {apiError && (
            <div className="vm-error-alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {apiError}
            </div>
          )}

          {/* Add Vehicle Button */}
          {!showAddForm && (
            <button className="vm-add-btn" onClick={() => setShowAddForm(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Register New Vehicle
            </button>
          )}

          {/* Add Vehicle Form */}
          {showAddForm && (
            <div className="vm-form-card">
              <div className="vm-form-header">
                <h2 className="vm-form-title">Register New Vehicle</h2>
                <button className="vm-form-close" onClick={() => setShowAddForm(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <form className="vm-form" onSubmit={handleAddVehicle}>
                <div className="vm-form-row">
                  <div className="vm-form-group">
                    <label className="vm-label">Vehicle Make *</label>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      className={`vm-input ${errors.make ? 'vm-input-error' : ''}`}
                      placeholder="e.g., Toyota, Honda, Ford"
                    />
                    {errors.make && <span className="vm-error">{errors.make}</span>}
                  </div>
                  <div className="vm-form-group">
                    <label className="vm-label">Vehicle Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className={`vm-input ${errors.model ? 'vm-input-error' : ''}`}
                      placeholder="e.g., Camry, Civic, F-150"
                    />
                    {errors.model && <span className="vm-error">{errors.model}</span>}
                  </div>
                </div>
                <div className="vm-form-row">
                  <div className="vm-form-group">
                    <label className="vm-label">Year *</label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className={`vm-input ${errors.year ? 'vm-input-error' : ''}`}
                      placeholder="e.g., 2020"
                    />
                    {errors.year && <span className="vm-error">{errors.year}</span>}
                  </div>
                  <div className="vm-form-group">
                    <label className="vm-label">Plate Number *</label>
                    <input
                      type="text"
                      name="plateNumber"
                      value={formData.plateNumber}
                      onChange={handleChange}
                      className={`vm-input ${errors.plateNumber ? 'vm-input-error' : ''}`}
                      placeholder="e.g., ABC 1234"
                    />
                    {errors.plateNumber && <span className="vm-error">{errors.plateNumber}</span>}
                  </div>
                </div>
                <div className="vm-form-row">
                  <div className="vm-form-group">
                    <label className="vm-label">Color *</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      className={`vm-input ${errors.color ? 'vm-input-error' : ''}`}
                      placeholder="e.g., Silver, Black, White"
                    />
                    {errors.color && <span className="vm-error">{errors.color}</span>}
                  </div>
                  <div className="vm-form-group">
                    <label className="vm-label">Vehicle Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className={`vm-input vm-select ${errors.type ? 'vm-input-error' : ''}`}
                    >
                      <option value="">Select type...</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Van">Van</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Wagon">Wagon</option>
                    </select>
                    {errors.type && <span className="vm-error">{errors.type}</span>}
                  </div>
                </div>
                <div className="vm-form-group">
                  <label className="vm-label">Additional Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="vm-input vm-textarea"
                    placeholder="Any additional details about your vehicle..."
                    rows="3"
                  ></textarea>
                </div>
                <div className="vm-form-actions">
                  <button type="button" className="vm-btn vm-btn-secondary" onClick={() => setShowAddForm(false)} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="vm-btn vm-btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Register Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Vehicle List */}
          <div className="vm-list-section">
            <h2 className="vm-section-title">
              Registered Vehicles
              <span className="vm-count">{vehicles.length}</span>
            </h2>

            {loading ? (
              <div className="vm-empty">
                <LoadingScreen compact />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="vm-empty">
                <div className="vm-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <p className="vm-empty-text">No vehicles registered yet</p>
                <p className="vm-empty-subtext">Add your first vehicle to get started</p>
              </div>
            ) : (
              <div className="vm-vehicle-grid">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="vm-vehicle-card">
                    <div className="vm-vehicle-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="2"/>
                        <path d="M16 8h4l3 3v5h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    </div>
                    <div className="vm-vehicle-info">
                      <h3 className="vm-vehicle-name">
                        {vehicle.make} {vehicle.model}
                        <span className="vm-vehicle-year">({vehicle.year})</span>
                      </h3>
                      <div className="vm-vehicle-details">
                        <span className="vm-vehicle-detail">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          {vehicle.plateNumber}
                        </span>
                        <span className="vm-vehicle-detail">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                          {vehicle.color}
                        </span>
                        <span className="vm-vehicle-detail">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                            <line x1="4" y1="22" x2="4" y2="15"/>
                          </svg>
                          {vehicle.type}
                        </span>
                      </div>
                    </div>
                    <div className="vm-vehicle-actions">
                      <button className="vm-action-btn vm-action-delete" onClick={() => handleDeleteVehicle(vehicle.id)} title="Delete Vehicle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleManagement;
