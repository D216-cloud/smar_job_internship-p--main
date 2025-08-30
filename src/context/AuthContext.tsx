import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Define the auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  userData: any;
  login: (email: string, password: string, role: string) => Promise<any>;
  register: (userData: any, type: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isTokenValid: (token: string | null) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  
  // Add debugging for userData
  useEffect(() => {
    console.log('AuthContext - userData updated:', auth.userData);
    console.log('AuthContext - userData._id:', auth.userData?._id);
    console.log('AuthContext - isAuthenticated:', auth.isAuthenticated);
    console.log('AuthContext - loading:', auth.loading);
  }, [auth.userData, auth.isAuthenticated, auth.loading]);
  
  // Prevent infinite re-renders by ensuring stable context value
  const contextValue = React.useMemo(() => auth, [
    auth.isAuthenticated,
    auth.userType,
    auth.userData,
    auth.loading
  ]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 