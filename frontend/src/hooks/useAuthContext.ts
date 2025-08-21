import { useContext } from 'react';
import type { AuthContextType } from '@/types/auth';
import { AuthContext } from '../context/AuthContext';
// Deprecated: Use useAuthContext from ../context/AuthContext.tsx instead.

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
