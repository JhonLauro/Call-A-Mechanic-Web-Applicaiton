const BASE_URL = '/api/v1';

// Extract the most useful error message from the backend's envelope:
// { success, data, error: { code, message, detail }, timestamp }
const extractError = (json, fallback) =>
  json?.error?.detail || json?.error?.message || json?.message || fallback;

/**
 * Login — accepts email, mechanic ID (e.g. 01-001), or admin ID (e.g. ADM-001).
 * Backend field name is "identifier", not "email".
 */
export const loginUser = async (identifier, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(extractError(json, 'Login failed. Please check your credentials.'));
  }

  // Backend wraps in { success, data: { token, user }, error, timestamp }
  return json.data;
};

/**
 * Register a new user.
 * @param {object} userData - { fullName, email, phoneNumber, password }
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(extractError(json, 'Registration failed. Please try again.'));
  }

  return json.data;
};

/**
 * Logout — clears session from localStorage.
 */
export const logoutUser = () => {
  localStorage.removeItem('cam_token');
  localStorage.removeItem('cam_user');
};
