import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    const { userType, userData, loading } = useAuthContext();
    
    // If still loading, show children (don't redirect yet)
    if (loading) {
      return <>{children}</>;
    }
    
    // If authenticated, redirect based on user type
    if (userData && userType === 'user') return <Navigate to="/user/home" replace />;
    if (userData && userType === 'company') return <Navigate to="/company/home" replace />;
    
    // If not authenticated, show children
    return <>{children}</>;
  } catch (error) {
    // If context is not available, show children (fallback)
    return <>{children}</>;
  }
};

export default PublicRoute; 