
import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextType } from '@/types/auth';

// 1. Define and export AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

// 2. Create and export useAuthContext hook
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// 3. Export AuthProvider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthContext - userData updated:', auth.userData);
      console.log('AuthContext - userData._id:', auth.userData?._id);
      console.log('AuthContext - isAuthenticated:', auth.isAuthenticated);
      console.log('AuthContext - loading:', auth.loading);
    }
  }, [auth.userData, auth.isAuthenticated, auth.loading]);

  const contextValue = useMemo(() => auth, [auth]);
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};