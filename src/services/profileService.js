import { requestApi } from './apiClient';

export const getProfile = (token) =>
  requestApi(
    '/profile',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    'Failed to load profile.',
    true
  );

export const updateProfile = (payload, token) =>
  requestApi(
    '/profile',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
    'Failed to update profile.',
    true
  );

export const updatePassword = (payload, token) =>
  requestApi(
    '/profile/password',
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
    'Failed to update password.',
    true
  );

export const uploadProfilePhoto = (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  return requestApi(
    '/profile/photo',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
    'Failed to upload photo.',
    true
  );
};
