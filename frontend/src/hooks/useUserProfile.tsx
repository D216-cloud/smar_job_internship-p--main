import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth?: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

interface ProfessionalBio {
  bio: string;
  currentPosition: string;
  currentCompany: string;
  experience: string;
  availability: 'immediate' | '2-weeks' | '1-month' | '3-months' | 'flexible';
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
  expectedSalary: string;
  interests: string;
}

interface Skills {
  technicalSkills: string;
  softSkills: string;
  languages: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: Date;
    expiry?: Date;
    credentialId: string;
  }>;
}

interface Resume {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadDate?: Date;
}

interface SocialLinks {
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  portfolio: string;
  instagram: string;
  facebook: string;
}

interface EducationHistory {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa: string;
  description: string;
  achievements: string[];
  isCurrent: boolean;
}

interface ExperienceHistory {
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface UserProfile {
  _id: string;
  userId: string;
  personalInfo: PersonalInfo;
  professionalBio: ProfessionalBio;
  skills: Skills;
  resume: Resume;
  socialLinks: SocialLinks;
  educationHistory: EducationHistory[];
  experienceHistory: ExperienceHistory[];
  profilePicture: string;
  isPublic: boolean;
  showContactInfo: boolean;
  showSalary: boolean;
  sectionsCompleted: {
    personalInfo: boolean;
    professionalBio: boolean;
    skills: boolean;
    resume: boolean;
    socialLinks: boolean;
    educationHistory: boolean;
    experienceHistory: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastSectionUpdated?: string;
}

interface ProfileCompletion {
  completionPercentage: number;
  sectionsCompleted: {
    personalInfo: boolean;
    professionalBio: boolean;
    skills: boolean;
    resume: boolean;
    socialLinks: boolean;
    educationHistory: boolean;
    experienceHistory: boolean;
  };
  sections: string[];
}

export const useUserProfile = () => {
  const { userData } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile completion status
  const fetchCompletion = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/completion', {
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

  // Save personal information section
  const savePersonalInfo = async (data: PersonalInfo) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/personal-info', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, personalInfo: data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save personal information');
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: "Error",
        description: "Failed to save personal information",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Save professional bio section
  const saveProfessionalBio = async (data: ProfessionalBio) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/professional-bio', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, professionalBio: data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save professional bio');
      }
    } catch (error) {
      console.error('Error saving professional bio:', error);
      toast({
        title: "Error",
        description: "Failed to save professional bio",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Save skills section
  const saveSkills = async (data: Skills) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/skills', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, skills: data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save skills');
      }
    } catch (error) {
      console.error('Error saving skills:', error);
      toast({
        title: "Error",
        description: "Failed to save skills",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Save resume section
  const saveResume = async (data: Resume) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/resume', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, resume: data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save resume');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Save social links section
  const saveSocialLinks = async (data: SocialLinks) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/social-links', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, socialLinks: data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save social links');
      }
    } catch (error) {
      console.error('Error saving social links:', error);
      toast({
        title: "Error",
        description: "Failed to save social links",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Save education history section
  const saveEducationHistory = async (data: EducationHistory[]) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/education', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ educationHistory: data }),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, educationHistory: data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save education history');
      }
    } catch (error) {
      console.error('Error saving education history:', error);
      toast({
        title: "Error",
        description: "Failed to save education history",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Save experience history section
  const saveExperienceHistory = async (data: ExperienceHistory[]) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user-profile/experience', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ experienceHistory: data }),
      });

      if (response.ok) {
        const result = await response.json();
        setProfile(prev => prev ? { ...prev, experienceHistory: data } : null);
        toast({
          title: "Success!",
          description: result.message,
        });
        await fetchCompletion();
        return result;
      } else {
        throw new Error('Failed to save experience history');
      }
    } catch (error) {
      console.error('Error saving experience history:', error);
      toast({
        title: "Error",
        description: "Failed to save experience history",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSaving(false);
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
    savePersonalInfo,
    saveProfessionalBio,
    saveSkills,
    saveResume,
    saveSocialLinks,
    saveEducationHistory,
    saveExperienceHistory,
    refetch: fetchProfile,
  };
}; 