import React from 'react';
import { useAuth } from '../context/AuthContext';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';
// Future imports for other dashboards:
// import MechanicDashboard from './MechanicDashboard';

/**
 * DashboardPage — Routes users to their role-specific dashboard.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase() || 'CLIENT';

  // Route to appropriate dashboard based on user role
  switch (role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'MECHANIC':
      // TODO: Replace with MechanicDashboard when ready
      return <ClientDashboard />;
    case 'CLIENT':
    default:
      return <ClientDashboard />;
  }
};

export default DashboardPage;
