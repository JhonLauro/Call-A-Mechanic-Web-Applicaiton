import { requestApi } from './apiClient';

/**
 * Login — accepts email, mechanic ID (e.g. 01-001), or admin ID (e.g. ADM-001).
 * Backend field name is "identifier", not "email".
 */
export const loginUser = async (identifier, password) => {
  return requestApi(
    '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    },
    'Login failed. Please check your credentials.',
    false
  );
};

/**
 * Register a new user.
 * @param {object} userData - { fullName, email, phoneNumber, password }
 */
export const registerUser = async (userData) => {
  return requestApi(
    '/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    },
    'Registration failed. Please try again.',
    false
  );
};

/**
 * Logout — clears session from localStorage.
 */
export const logoutUser = () => {
  localStorage.removeItem('cam_token');
  localStorage.removeItem('cam_user');
};
