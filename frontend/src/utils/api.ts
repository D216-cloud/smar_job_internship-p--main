import { toast } from '@/hooks/use-toast';

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
    const response = await fetch(url, {
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
