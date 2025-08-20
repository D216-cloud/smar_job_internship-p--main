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
      const errorData = await response.json();
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
