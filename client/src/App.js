import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ActivityTracker from './components/ActivityTracker';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import './styles/input.css';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Create a separate component for routes to use useAuth hook
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ?
          <Navigate to="/" replace /> :
          <LoginForm />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ?
          <Navigate to="/" replace /> :
          <RegisterForm />
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordForm />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ActivityTracker />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route redirects to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;