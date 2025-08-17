import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { jwtDecode, JwtPayload } from "jwt-decode";

interface UserData {
  _id: string;
  email: string;
  type?: string;
  role?: string;
}

interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  [key: string]: string | undefined;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Utility: Validate token before making authenticated requests
  const isTokenValid = (token: string | null) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token) as JwtPayload;
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        console.log('Token expired at:', new Date(decoded.exp * 1000));
        return false;
      }
      return true;
    } catch (error) {
      console.log('Token validation error:', error);
      return false;
    }
  };

  // Utility: Get token expiration time
  const getTokenExpiration = (token: string) => {
    try {
      const decoded = jwtDecode(token) as JwtPayload;
      return decoded.exp ? new Date(decoded.exp * 1000) : null;
    } catch {
      return null;
    }
  };

  // Utility: Make authenticated request
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      clearAuthData();
      throw new Error('No valid authentication token found');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      clearAuthData();
      throw new Error('Authentication token expired');
    }

    return response;
  };

  const clearAuthData = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      setIsAuthenticated(false);
      setUserType(null);
      setUserData(null);
  };

  const fetchProfile = useCallback(async (token: string) => {
    try {
      // Validate token before making request
      if (!isTokenValid(token)) {
        console.log('Token is invalid, logging out');
        clearAuthData();
        toast({ 
          title: 'Session Expired', 
          description: 'Your session has expired. Please log in again.', 
          variant: 'destructive', 
          duration: 5000 
        });
        navigate('/login');
        return;
      }

      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        // Token invalid or expired: force logout
        console.log('401 Unauthorized, clearing auth data');
        clearAuthData();
        toast({ 
          title: 'Session Expired', 
          description: 'Please log in again to continue.', 
          variant: 'destructive', 
          duration: 5000 
        });
        navigate('/login');
        return;
      }
      
      if (!res.ok) {
        console.log('Profile fetch failed:', res.status, res.statusText);
        throw new Error(`Profile fetch failed: ${res.status}`);
      }
      
      const response = await res.json();
      console.log('Profile response received:', response);
      
      // Extract user data from the response wrapper
      const user = response.user || response;
      console.log('User ID from profile:', user._id);
      console.log('User data structure:', JSON.stringify(user, null, 2));
      
      setUserData(user);
      setUserType(user.type || user.role);
      setIsAuthenticated(true);
      localStorage.setItem('userType', user.type || user.role);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Log token expiration for debugging
      const expiration = getTokenExpiration(token);
      if (expiration) {
        console.log('Token expires at:', expiration);
        const timeUntilExpiry = expiration.getTime() - Date.now();
        console.log('Time until expiry:', Math.round(timeUntilExpiry / 1000 / 60), 'minutes');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      clearAuthData();
      toast({ 
        title: 'Authentication Error', 
        description: 'Failed to verify your session. Please log in again.', 
        variant: 'destructive', 
        duration: 5000 
      });
      navigate('/login');
    }
  }, [navigate]); // Add navigate as dependency for useCallback

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isTokenValid(token)) {
      fetchProfile(token!).finally(() => setLoading(false));
    } else {
      // Clear invalid token and set loading to false
      console.log('Invalid or expired token found, clearing auth data');
      clearAuthData();
      setLoading(false);
    }
  }, [fetchProfile]); // Include fetchProfile as dependency

  const login = async (email: string, password: string, role: string) => {
    // Auto-trim and lowercase role, and trim email
    const sanitizedEmail = email?.trim();
    const sanitizedPassword = password?.trim();
    const sanitizedRole = role?.toLowerCase().trim();
    if (!sanitizedEmail || !sanitizedPassword || !sanitizedRole) {
      toast({ title: 'Login Failed', description: 'All fields are required.', variant: 'destructive', duration: 3000 });
      return null;
    }
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword, role: sanitizedRole })
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Login response received:', data);
        console.log('User data from login:', data.user);
        console.log('User ID from login:', data.user._id);
        
        localStorage.setItem('token', data.token);
        setUserData(data.user);
        setUserType(data.user.type || data.user.role);
        localStorage.setItem('userType', data.user.type || data.user.role);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setIsAuthenticated(true);
        
        // Log successful login
        console.log('Login successful for:', data.user.email);
        const expiration = getTokenExpiration(data.token);
        if (expiration) {
          console.log('Token expires at:', expiration);
        }
        
        // Redirect based on user type after successful login
        setTimeout(() => {
          if (data.user.type === 'company' || data.user.role === 'company') {
            navigate('/company/home');
          } else {
            navigate('/user/home');
          }
        }, 100);
        
        return data.user;
      } else {
        toast({ title: 'Login Failed', description: data.message || data.error || 'Login failed. Please try again.', variant: 'destructive', duration: 3000 });
        return null;
      }
    } catch (error) {
      toast({ title: 'Login Failed', description: 'Network error. Please try again.', variant: 'destructive', duration: 3000 });
      return null;
    }
  };

  const register = async (userData: RegisterData, type: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, role: type })
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: 'Registration Failed',
          description: data.error || 'Registration failed. Please try again.',
          variant: 'destructive',
          duration: 3000,
        });
        return false;
      }
      // For both user and company, do not auto-login. Redirect to login page after signup.
      toast({
        title: 'Registration Successful! 🎉',
        description: 'Your account has been created. Please log in to continue.',
        duration: 3000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return true;
    } catch (err) {
      toast({
        title: 'Registration Failed',
        description: 'Registration failed. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
      return false;
    }
  };

  const logout = () => {
    clearAuthData();
    toast({ 
      title: 'Logged Out', 
      description: 'You have been successfully logged out.', 
      duration: 3000 
    });
    navigate('/login');
  };

  return {
    isAuthenticated,
    userType,
    userData,
    login,
    register,
    logout,
    loading,
    isTokenValid, // Export for use in other components
  };
}; 