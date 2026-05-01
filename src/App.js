import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientDashboard from './pages/client/ClientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import MechanicDashboard from './pages/mechanic/MechanicDashboard';
import ProfilePage from './pages/profile/ProfilePage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import EditPasswordPage from './pages/profile/EditPasswordPage';
import UploadPhotoPage from './pages/profile/UploadPhotoPage';
import UserRegistryPage from './pages/admin/UserRegistryPage';

const VALID_ROLES = ['CLIENT', 'ADMIN', 'MECHANIC'];

const getNormalizedRole = (user) => {
  const role = String(user?.role || 'CLIENT').toUpperCase();
  return VALID_ROLES.includes(role) ? role : 'CLIENT';
};

const getDashboardPathForRole = (user) => {
  const role = getNormalizedRole(user);
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'MECHANIC') return '/mechanic/dashboard';
  return '/client/dashboard';
};

const LoadingScreen = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: '#6b7280',
      fontSize: '15px',
    }}
  >
    Loading...
  </div>
);

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Shows nothing while the auth state is hydrating from localStorage.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * RoleProtectedRoute — allows only specific roles and redirects others
 * to their own role dashboard.
 */
const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const role = getNormalizedRole(user);
  return allowedRoles.includes(role) ? children : <Navigate to={getDashboardPathForRole(user)} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['CLIENT']}>
              <ClientDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/mechanic/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['MECHANIC']}>
              <MechanicDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <AdminProfilePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <UserRegistryPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/password"
          element={
            <ProtectedRoute>
              <EditPasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/photo"
          element={
            <ProtectedRoute>
              <UploadPhotoPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
