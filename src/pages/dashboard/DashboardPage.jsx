import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * DashboardPage — redirects users to their canonical role dashboard path.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const rawRole = String(user?.role || 'CLIENT').toUpperCase();
  const role = ['ADMIN', 'CLIENT', 'MECHANIC'].includes(rawRole) ? rawRole : 'CLIENT';

  switch (role) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'MECHANIC':
      return <Navigate to="/mechanic/dashboard" replace />;
    case 'CLIENT':
    default:
      return <Navigate to="/client/dashboard" replace />;
  }
};

export default DashboardPage;
