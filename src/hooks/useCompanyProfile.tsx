import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface CompanyProfile {
  _id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  industry: string;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  companyType: 'startup' | 'sme' | 'enterprise' | 'nonprofit' | 'government';
  foundedYear: string;
  revenue: string;
  employeeCount: number;
  description: string;
  mission: string;
  values: string[];
  remotePolicy: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  benefits: string[];
  technologies: string[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  logo: string;
  banner: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  isPublic: boolean;
  showContactInfo: boolean;
  showEmployeeCount: boolean;
  jobsPosted: string[];
  totalApplications: number;
  profileViews: number;
  createdAt: string;
  updatedAt: string;
}

interface ProfileCompletion {
  completionPercentage: number;
  sections: string[];
}

export const useCompanyProfile = () => {
  const { userData } = useAuthContext();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);

  // Fetch company profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/company-profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch company profile');
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile completion status
  const fetchCompletion = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/company-profile/completion', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompletion(data);
      }
    } catch (error) {
      console.error('Error fetching completion:', error);
    }
  }, []);

  // Save entire company profile (single save)
  const saveProfile = async (data: Partial<CompanyProfile>) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/company-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, ...data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save company profile');
      }
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: "Error",
        description: "Failed to save company profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Increment application count
  const incrementApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/company-profile/increment-applications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, totalApplications: result.totalApplications } : null);
        return result;
      }
    } catch (error) {
      console.error('Error incrementing applications:', error);
    }
  };

  // Initialize profile data
  useEffect(() => {
    if (userData) {
      fetchProfile();
      fetchCompletion();
    }
  }, [userData, fetchProfile, fetchCompletion]);

  return {
    profile,
    loading,
    saving,
    completion,
    saveProfile,
    incrementApplications,
    refetch: fetchProfile,
  };
}; 