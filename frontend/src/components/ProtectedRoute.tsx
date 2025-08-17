import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'user' | 'company' }> = ({ children, role }) => {
  const { userData, userType, isAuthenticated, loading } = useAuthContext();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && userType !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default ProtectedRoute; 