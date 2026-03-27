import { requestApi } from './apiClient';

/**
 * Get appointments - filtered by user role on backend
 * - CLIENT: returns only their appointments
 * - MECHANIC: returns assigned appointments
 * - ADMIN: returns all appointments
 */
export const getAppointments = (token) =>
  requestApi(
    '/appointments',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'Failed to load appointments.',
    true
  );

/**
 * Create a new appointment (clients only)
 * @param {object} data - { serviceType, vehicleInfo, problemDescription, scheduledDate }
 */
export const createAppointment = (data, token) =>
  requestApi(
    '/appointments',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
    'Failed to create appointment.',
    true
  );

/**
 * Update appointment status (mechanic or admin only)
 * @param {number} appointmentId - The appointment ID
 * @param {string} status - "PENDING", "IN_PROGRESS", "COMPLETED", or "CANCELLED"
 */
export const updateAppointmentStatus = (appointmentId, status, token) =>
  requestApi(
    `/appointments/${appointmentId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
    'Failed to update appointment status.',
    true
  );

/**
 * Mechanic claims an unassigned appointment
 * @param {number} appointmentId - The appointment ID
 */
export const claimAppointment = (appointmentId, token) =>
  requestApi(
    `/appointments/${appointmentId}/claim`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'Failed to claim appointment.',
    true
  );
