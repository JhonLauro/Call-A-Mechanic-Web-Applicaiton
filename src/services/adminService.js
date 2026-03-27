import { requestApi } from './apiClient';

/**
 * Get all users (clients and mechanics) - Admin only
 * Returns: { users: [{ id, fullName, email, phoneNumber, role, mechanicId, isActive }] }
 */
export const getAllUsers = (token) =>
  requestApi(
    '/admin/users',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'Failed to load users.',
    true
  );

/**
 * Create a new mechanic account - Admin only
 * @param {object} data - { fullName, email, phoneNumber, password, mechanicId }
 */
export const createMechanic = (data, token) =>
  requestApi(
    '/admin/mechanics',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
    'Failed to create mechanic account.',
    true
  );

/**
 * Delete a user account - Admin only
 * @param {number} userId - The user ID to delete
 */
export const deleteUser = (userId, token) =>
  requestApi(
    `/admin/users/${userId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'Failed to delete user.',
    true
  );

/**
 * Assign a mechanic to an appointment - Admin only
 * @param {number} appointmentId - The appointment ID
 * @param {number} mechanicId - The user ID of the mechanic to assign
 */
export const assignMechanic = (appointmentId, mechanicId, token) =>
  requestApi(
    `/admin/appointments/${appointmentId}/assign-mechanic`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mechanicId }),
    },
    'Failed to assign mechanic.',
    true
  );
