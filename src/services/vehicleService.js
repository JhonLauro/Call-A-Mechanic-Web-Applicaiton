import { friendlyErrorMessage } from '../utils/friendlyErrors';

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '/api/v1').replace(/\/$/, '');

/**
 * Generic request handler for Vehicle API
 */
const requestApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { success: false, error: 'Invalid response format', data: null };
    }

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || 'Request failed';
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error(friendlyErrorMessage(error));
  }
};

/**
 * Get all vehicles for authenticated user
 * GET /api/v1/vehicles
 */
export const getVehicles = async (token) => {
  const response = await requestApi('/vehicles', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Returns array of vehicles
};

/**
 * Get specific vehicle by ID
 * GET /api/v1/vehicles/{id}
 */
export const getVehicleById = async (vehicleId, token) => {
  const response = await requestApi(`/vehicles/${vehicleId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Returns single vehicle object
};

/**
 * Create new vehicle
 * POST /api/v1/vehicles
 */
export const createVehicle = async (vehicleData, token) => {
  const response = await requestApi('/vehicles', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vehicleData),
  });
  return response.data; // Returns created vehicle
};

/**
 * Update vehicle
 * PUT /api/v1/vehicles/{id}
 */
export const updateVehicle = async (vehicleId, vehicleData, token) => {
  const response = await requestApi(`/vehicles/${vehicleId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vehicleData),
  });
  return response.data; // Returns updated vehicle
};

/**
 * Delete vehicle
 * DELETE /api/v1/vehicles/{id}
 */
export const deleteVehicle = async (vehicleId, token) => {
  const response = await requestApi(`/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // Returns success message
};
