import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // hydrating from localStorage

  // Rehydrate session from localStorage on first mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('cam_token');
      const storedUser = localStorage.getItem('cam_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // corrupted data — clear it
      localStorage.removeItem('cam_token');
      localStorage.removeItem('cam_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('cam:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('cam:unauthorized', handleUnauthorized);
    };
  }, []);

  const persistSession = (tokenValue, userValue) => {
    localStorage.setItem('cam_token', tokenValue);
    localStorage.setItem('cam_user', JSON.stringify(userValue));
    setToken(tokenValue);
    setUser(userValue);
  };

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password);
    const identifier = String(email || '').trim();
    const role = String(data.user?.role || '').toUpperCase();
    const accountIdentifier = identifier && !identifier.includes('@') ? identifier : data.user?.accountIdentifier;
    const enrichedUser = {
      ...data.user,
      ...(accountIdentifier ? { accountIdentifier } : {}),
      ...(role === 'MECHANIC' && accountIdentifier && !data.user?.mechanicId ? { mechanicId: accountIdentifier } : {}),
      ...(role === 'ADMIN' && accountIdentifier && !data.user?.adminId ? { adminId: accountIdentifier } : {}),
    };
    persistSession(data.token, enrichedUser);
    return { ...data, user: enrichedUser };
  }, []);

  const register = useCallback(async (userData) => {
    const data = await registerUser(userData);
    persistSession(data.token, data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((currentUser) => {
      const nextUser = { ...(currentUser || {}), ...(updates || {}) };
      localStorage.setItem('cam_user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
