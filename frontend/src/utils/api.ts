
import { toast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast({
      title: "Authentication Error",
      description: "You are not logged in. Please log in and try again.",
      variant: "destructive",
    });
    window.location.href = '/login';
    throw new Error('No authentication token found');
  }
  try {
    // If url is relative, prepend API_BASE_URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    if (!response.ok) {
      let errorData: { error?: string } = {};
      try {
        errorData = await response.json();
      } catch (_error) {
        // Ignore JSON parsing errors
      }
      throw new Error(errorData.error || 'Request failed');
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    toast({
      title: "Request Failed",
      description: error.message || "Something went wrong",
      variant: "destructive",
    });
    throw error;
  }
};

// Helper to refresh token (if you implement refresh tokens)
export const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    window.location.href = '/login';
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh })
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.token;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return null;
    }
  } catch {
    window.location.href = '/login';
    return null;
  }
};

// Helper to logout
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
};
