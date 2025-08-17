import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
// Lazy-load heavy resume management to speed initial profile render
const ResumeUpload = React.lazy(() => import('@/components/ResumeUpload'));

// Define interface for profile data
interface ProfileData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  professionalBio?: {
    bio?: string;
    currentPosition?: string;
    currentCompany?: string;
    experience?: string;
    expectedSalary?: string;
    availability?: string;
    interests?: string;
    remotePreference?: string;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    portfolio?: string;
  };
  skills?: {
    technicalSkills?: string;
    languages?: string[];
    certifications?: string[];
  };
  education?: Array<unknown>;
  experience?: Array<unknown>;
  avatar?: string;
  resume?: string;
  resumeUrl?: string;
}

import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, 
  Upload, 
  Save, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Award, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Target, 
  CheckCircle, 
  Clock, 
  Star,
  Calendar,
  Building,
  ExternalLink,
  Download,
  Eye,
  EyeOff,
  Camera,
  Settings,
  Sparkles,
  TrendingUp,
  Heart,
  MessageSquare,
  Bell,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const UserProfile = () => {
  const { userData, logout } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [appliedCount, setAppliedCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Enhanced form state
  const [form, setForm] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    location: userData?.location || '',
    bio: userData?.bio || '',
    skills: userData?.skills || '',
    avatar: userData?.avatar || '',
    linkedin: userData?.linkedin || '',
    github: userData?.github || '',
    website: userData?.website || '',
    resume: userData?.resume || '',
    currentCompany: userData?.currentCompany || '',
    currentPosition: userData?.currentPosition || '',
    experience: userData?.experience || '',
    expectedSalary: userData?.expectedSalary || '',
    availability: userData?.availability || 'immediate',
    remotePreference: userData?.remotePreference || 'hybrid',
    education: userData?.education || [],
    experienceHistory: userData?.experienceHistory || [],
    certifications: userData?.certifications || [],
    languages: userData?.languages || [],
    interests: userData?.interests || '',
    portfolio: userData?.portfolio || '',
    twitter: userData?.twitter || '',
    instagram: userData?.instagram || '',
    facebook: userData?.facebook || '',
  });

  const [avatarPreview, setAvatarPreview] = useState(form.avatar);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` } as HeadersInit;

        // Fetch both endpoints in parallel to reduce TTFB
        const [authRes, profileRes] = await Promise.all([
          fetch('/api/auth/profile', { headers }),
          fetch('/api/user-profile/', { headers })
        ]);

        let user = {} as Record<string, unknown>;
        if (authRes.ok) {
          const authData = await authRes.json();
          user = (authData.data || authData) as Record<string, unknown>;
        }

        let profileData: ProfileData = {};
        if (profileRes.ok) {
          const profileResult = await profileRes.json();
          profileData = (profileResult.data || profileResult) as ProfileData;
        }
        
        // Merge auth data with profile data
        const ensureArray = <T,>(val: unknown): T[] => Array.isArray(val) ? (val as T[]) : [];
        const getProfilePicture = (pd: ProfileData | undefined): string => {
          const maybe = pd as ProfileData & { profilePicture?: string; avatar?: string };
          return (maybe?.profilePicture || maybe?.avatar || '') as string;
        };
        const combinedData = {
          ...user,
          ...(profileData.personalInfo || {}),
          ...(profileData.professionalBio || {}),
          ...(profileData.socialLinks || {}),
          skills: profileData.skills?.technicalSkills || (user as Record<string, unknown>).skills || '',
          education: ensureArray(profileData && (profileData as { educationHistory?: unknown }).educationHistory),
          experienceHistory: ensureArray(profileData && (profileData as { experienceHistory?: unknown }).experienceHistory),
          certifications: profileData.skills?.certifications || [],
          languages: profileData.skills?.languages || [],
          avatar: getProfilePicture(profileData) || (user as Record<string, unknown>).avatar || '',
          resume: profileData.resumeUrl || profileData.resume || (user as Record<string, unknown>).resume || '',
        };
        
  // console.debug('Combined profile data:', combinedData);
        
        const updatedForm = {
          firstName: combinedData.firstName || '',
          lastName: combinedData.lastName || '',
          email: combinedData.email || '',
          phone: combinedData.phone || '',
          location: combinedData.location || '',
          bio: combinedData.bio || '',
          skills: combinedData.skills || '',
          avatar: combinedData.avatar || '',
          linkedin: combinedData.linkedin || '',
          github: combinedData.github || '',
          website: combinedData.website || '',
          resume: combinedData.resume || '',
          currentCompany: combinedData.currentCompany || '',
          currentPosition: combinedData.currentPosition || '',
          experience: combinedData.experience || '',
          expectedSalary: combinedData.expectedSalary || '',
          availability: combinedData.availability || 'immediate',
          remotePreference: combinedData.remotePreference || 'hybrid',
          education: Array.isArray(combinedData.education) ? combinedData.education : [],
          experienceHistory: Array.isArray(combinedData.experienceHistory) ? combinedData.experienceHistory : [],
          certifications: combinedData.certifications || [],
          languages: combinedData.languages || [],
          interests: combinedData.interests || '',
          portfolio: combinedData.portfolio || '',
          twitter: combinedData.twitter || '',
          instagram: combinedData.instagram || '',
          facebook: combinedData.facebook || '',
        };
        
        setForm(updatedForm);
        setAvatarPreview(combinedData.avatar || '');
        calculateProfileCompletion(updatedForm);
  // Also sync with backend completion (has section-based flags)
  fetchCompletionStatus();
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data from database.",
          variant: "destructive",
        });
      }
    };
    
    if (userData?.email) {
      fetchUserProfile();
    }
  }, [userData?.email]);

  useEffect(() => {
    if (userData?.email) {
      fetch(`/api/applications/user/${userData.email}`)
        .then(res => res.json())
        .then(apps => setAppliedCount(apps.length || 0));
    }
  }, [userData?.email]);

  const calculateProfileCompletion = (profileData) => {
    // Section-based completion to avoid odd percentages like 94%
    const sections = {
      personalInfo: Boolean(profileData.firstName && profileData.lastName && (profileData.email || '')),
      professionalBio: Boolean(
        profileData.bio || profileData.currentPosition || profileData.currentCompany || profileData.experience || profileData.expectedSalary
      ),
      skills: Boolean(profileData.skills),
      resume: Boolean(profileData.resume),
      socialLinks: Boolean(
        profileData.linkedin || profileData.github || profileData.website || profileData.portfolio || profileData.twitter || profileData.instagram || profileData.facebook
      ),
      educationHistory: Array.isArray(profileData.education) && profileData.education.length > 0,
      experienceHistory: Array.isArray(profileData.experienceHistory) && profileData.experienceHistory.length > 0,
    };
    const totalSections = Object.keys(sections).length;
    const completedSections = Object.values(sections).filter(Boolean).length;
    setProfileCompletion(Math.round((completedSections / totalSections) * 100));
  };

  const fetchCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user-profile/completion', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.completionPercentage === 'number') {
          setProfileCompletion(Math.min(100, Math.max(0, Math.round(data.completionPercentage))));
        }
      }
    } catch (e) {
      // fall back silently to local calculation
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    calculateProfileCompletion({ ...form, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    calculateProfileCompletion({ ...form, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setForm(prev => ({ ...prev, avatar: reader.result }));
        calculateProfileCompletion({ ...form, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    const saveResults = {
      personal: false,
      professional: false,
      skills: false,
      social: false,
      education: false,
      experience: false,
      documents: false
    };
    
    try {
      const token = localStorage.getItem('token');
      console.log('Starting profile save process...');
      
      // Save personal information
      const personalInfoData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        location: form.location
      };
      
      console.log('Saving personal info:', personalInfoData);
      
      try {
        const personalRes = await fetch('/api/user-profile/personal-info', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(personalInfoData),
        });
        
        if (personalRes.ok) {
          saveResults.personal = true;
          console.log('Personal info saved successfully');
        } else {
          const errorData = await personalRes.json();
          console.error('Personal info save failed:', errorData);
        }
      } catch (error) {
        console.error('Personal info save error:', error);
      }
      
      // Save professional bio
      const professionalBioData = {
        bio: form.bio,
        currentPosition: form.currentPosition,
        currentCompany: form.currentCompany,
        experience: form.experience,
        availability: form.availability,
        remotePreference: form.remotePreference,
        expectedSalary: form.expectedSalary,
        interests: form.interests
      };
      
      console.log('Saving professional bio:', professionalBioData);
      
      try {
        const professionalRes = await fetch('/api/user-profile/professional-bio', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(professionalBioData),
        });
        
        if (professionalRes.ok) {
          saveResults.professional = true;
          console.log('Professional bio saved successfully');
        } else {
          const errorData = await professionalRes.json();
          console.error('Professional bio save failed:', errorData);
        }
      } catch (error) {
        console.error('Professional bio save error:', error);
      }
      
      // Save skills
      const skillsData = {
        technicalSkills: form.skills,
        softSkills: '',
        languages: form.languages || [],
        certifications: form.certifications || []
      };
      
      console.log('Saving skills:', skillsData);
      
      try {
        const skillsRes = await fetch('/api/user-profile/skills', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(skillsData),
        });
        
        if (skillsRes.ok) {
          saveResults.skills = true;
          console.log('Skills saved successfully');
        } else {
          const errorData = await skillsRes.json();
          console.error('Skills save failed:', errorData);
        }
      } catch (error) {
        console.error('Skills save error:', error);
      }
      
      // Save education history
      const educationData = {
        educationHistory: form.education || []
      };
      
      console.log('Saving education history:', educationData);
      
      try {
        const educationRes = await fetch('/api/user-profile/education', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(educationData),
        });
        
        if (educationRes.ok) {
          saveResults.education = true;
          console.log('Education history saved successfully');
        } else {
          const errorData = await educationRes.json();
          console.error('Education history save failed:', errorData);
        }
      } catch (error) {
        console.error('Education history save error:', error);
      }
      
      // Save experience history
      const experienceData = {
        experienceHistory: form.experienceHistory || []
      };
      
      console.log('Saving experience history:', experienceData);
      
      try {
        const experienceRes = await fetch('/api/user-profile/experience', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(experienceData),
        });
        
        if (experienceRes.ok) {
          saveResults.experience = true;
          console.log('Experience history saved successfully');
        } else {
          const errorData = await experienceRes.json();
          console.error('Experience history save failed:', errorData);
        }
      } catch (error) {
        console.error('Experience history save error:', error);
      }
      
      // Save documents (resume URL if available)
      if (form.resume) {
        const documentsData = {
          resumeUrl: form.resume,
          resumeUploadDate: new Date().toISOString()
        };
        
        console.log('Saving documents:', documentsData);
        
        try {
          const documentsRes = await fetch('/api/user-profile/resume', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(documentsData),
          });
          
          if (documentsRes.ok) {
            saveResults.documents = true;
            console.log('Documents saved successfully');
          } else {
            const errorData = await documentsRes.json();
            console.error('Documents save failed:', errorData);
          }
        } catch (error) {
          console.error('Documents save error:', error);
        }
      } else {
        // Mark documents as saved if no resume to save
        saveResults.documents = true;
        console.log('No documents to save, marking as successful');
      }
      
      // Save social links
      const socialLinksData = {
        linkedin: form.linkedin,
        github: form.github,
        twitter: form.twitter,
        website: form.website,
        portfolio: form.portfolio,
        instagram: form.instagram,
        facebook: form.facebook
      };
      
      console.log('Saving social links:', socialLinksData);
      
      try {
        const socialRes = await fetch('/api/user-profile/social-links', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(socialLinksData),
        });
        
        if (socialRes.ok) {
          saveResults.social = true;
          console.log('Social links saved successfully');
        } else {
          const errorData = await socialRes.json();
          console.error('Social links save failed:', errorData);
        }
      } catch (error) {
        console.error('Social links save error:', error);
      }

      // Save profile picture (avatar) into profile.profilePicture
      try {
        if (form.avatar) {
          await fetch('/api/user-profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ profilePicture: form.avatar })
          });
        }
      } catch (error) {
        console.error('Profile picture save error:', error);
      }
      
      // Check results and show appropriate message
      const successCount = Object.values(saveResults).filter(Boolean).length;
      const totalCount = Object.keys(saveResults).length;
      
      console.log('Save results:', saveResults);
      console.log(`Successfully saved ${successCount}/${totalCount} sections`);
      
      if (successCount === totalCount) {
        toast({
          title: "✅ Profile Saved Successfully!",
          description: `All profile sections have been saved to MongoDB database. Data is now accessible across the application.`,
          variant: "default",
        });
        // Refresh Technical Skills from DB to confirm persistence
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/user-profile', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const latest = await res.json();
            const latestSkills = latest?.skills || latest?.data?.skills || '';
            setForm(prev => ({ ...prev, skills: latestSkills }));
          }
        } catch (e) {
          // no-op
        }
        // Sync completion bar with backend post-save
        await fetchCompletionStatus();
      } else if (successCount > 0) {
        toast({
          title: "⚠️ Partially Saved",
          description: `${successCount}/${totalCount} sections saved successfully. Some data may not have been updated.`,
          variant: "default",
        });
      } else {
        toast({
          title: "❌ Save Failed",
          description: "Unable to save profile data to database. Please check your connection and try again.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const viewSavedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Current Profile Data in Database:\n\n- Name: ${data.firstName} ${data.lastName}\n- Email: ${data.email}\n- Phone: ${data.phone || 'Not provided'}\n- Location: ${data.location || 'Not provided'}\n- Current Position: ${data.currentPosition || 'Not provided'}\n- Current Company: ${data.currentCompany || 'Not provided'}\n- Experience: ${data.experience || 'Not provided'}\n- Education: ${data.education || 'Not provided'}\n- Skills: ${data.skills || 'Not provided'}\n- Expected Salary: ${data.expectedSalary || 'Not provided'}\n- LinkedIn: ${data.linkedin || 'Not provided'}\n- GitHub: ${data.github || 'Not provided'}\n- Website: ${data.website || 'Not provided'}\n- Bio: ${data.bio || 'Not provided'}`);
      } else {
        alert('Error fetching saved data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching saved data:', error);
      alert('Error fetching saved data. Please try again.');
    }
  };

  const addEducation = () => {
    setForm(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      }]
    }));
  };

  const addExperience = () => {
    setForm(prev => ({
      ...prev,
  experienceHistory: [...(Array.isArray(prev.experienceHistory) ? prev.experienceHistory : []), {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateEducation = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const updateExperience = (index, field, value) => {
    setForm(prev => ({
      ...prev,
  experienceHistory: (Array.isArray(prev.experienceHistory) ? prev.experienceHistory : []).map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeEducation = (index) => {
    setForm(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeExperience = (index) => {
    setForm(prev => ({
      ...prev,
  experienceHistory: (Array.isArray(prev.experienceHistory) ? prev.experienceHistory : []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="p-4 border-b bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                <p className="text-gray-600">Complete your profile with our split-screen interface</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={viewSavedData} 
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Data
              </Button>
              <Button
                onClick={logout} 
                variant="outline" 
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Fixed Sidebar */}
          <div className="w-1/4 border-r bg-white/80 backdrop-blur-sm">
            <div className="p-6 h-full overflow-y-auto">

              <Card className="border-0 shadow-xl bg-white/90">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                        <AvatarImage src={avatarPreview} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {form.firstName?.[0]?.toUpperCase() || form.lastName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      {form.firstName} {form.lastName}
                    </h3>
                    <p className="text-gray-600 text-sm text-center">{form.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {appliedCount} applications
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {userData?.role || 'User'}
                      </span>
                    </div>
                  </div>

                  {/* Profile Stats */}
                  <div className="space-y-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{appliedCount}</div>
                      <div className="text-xs text-gray-600">Applications</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{profileCompletion}%</div>
                      <div className="text-xs text-gray-600">Complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Profile Completion</span>
                      <span>{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>

                  {/* Profile Checklist */}
                  <div className="space-y-2 text-sm mb-6">
                    <div className="font-medium text-gray-900 mb-3">Profile Checklist</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${(form.firstName && form.lastName) ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={(form.firstName && form.lastName) ? 'text-gray-700' : 'text-gray-400'}>Name</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${form.bio ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={form.bio ? 'text-gray-700' : 'text-gray-400'}>Bio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${form.skills ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={form.skills ? 'text-gray-700' : 'text-gray-400'}>Skills</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${form.resume ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={form.resume ? 'text-gray-700' : 'text-gray-400'}>Resume</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {saving ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Scrollable Main Form */}
          <div className="w-3/4 overflow-y-auto">
            <div className="p-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-8">
                  
                  {/* Personal Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          placeholder="City, State, Country"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Briefcase className="h-5 w-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Professional Information</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself, your experience, and what you're looking for..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="currentPosition">Current Position</Label>
                          <Input
                            id="currentPosition"
                            name="currentPosition"
                            value={form.currentPosition}
                            onChange={handleChange}
                            placeholder="e.g., Senior Software Engineer"
                          />
                        </div>
                        <div>
                          <Label htmlFor="currentCompany">Current Company</Label>
                          <Input
                            id="currentCompany"
                            name="currentCompany"
                            value={form.currentCompany}
                            onChange={handleChange}
                            placeholder="e.g., Tech Corp Inc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="experience">Years of Experience</Label>
                          <Select value={form.experience} onValueChange={(value) => handleSelectChange('experience', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0-1">0-1 years</SelectItem>
                              <SelectItem value="1-3">1-3 years</SelectItem>
                              <SelectItem value="3-5">3-5 years</SelectItem>
                              <SelectItem value="5-10">5-10 years</SelectItem>
                              <SelectItem value="10+">10+ years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="expectedSalary">Expected Salary</Label>
                          <Input
                            id="expectedSalary"
                            name="expectedSalary"
                            value={form.expectedSalary}
                            onChange={handleChange}
                            placeholder="e.g., $80,000 - $100,000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="availability">Availability</Label>
                          <Select value={form.availability} onValueChange={(value) => handleSelectChange('availability', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="2-weeks">2 weeks notice</SelectItem>
                              <SelectItem value="1-month">1 month notice</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="remotePreference">Work Preference</Label>
                          <Select value={form.remotePreference} onValueChange={(value) => handleSelectChange('remotePreference', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="onsite">On-site</SelectItem>
                              <SelectItem value="flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="interests">Interests & Goals</Label>
                        <Textarea
                          id="interests"
                          name="interests"
                          value={form.interests}
                          onChange={handleChange}
                          placeholder="What are your career interests and goals?"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills & Qualifications */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Skills & Qualifications</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="skills">Technical Skills</Label>
                        <Textarea
                          id="skills"
                          name="skills"
                          value={form.skills}
                          onChange={handleChange}
                          placeholder="List your technical skills (e.g., JavaScript, React, Node.js, Python, SQL...)"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Languages</Label>
                          <div className="mt-2">
                            {form.languages && form.languages.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {form.languages.map((lang, index) => (
                                  <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700">
                                    {lang}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No languages added yet</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>Certifications</Label>
                          <div className="mt-2">
                            {form.certifications && form.certifications.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {form.certifications.map((cert, index) => (
                                  <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No certifications added yet</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <GraduationCap className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                      </div>
                      <Button onClick={addEducation} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {form.education && form.education.length > 0 ? (
                        form.education.map((edu, index) => (
                          <Card key={index} className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Institution</Label>
                                  <Input
                                    value={edu.institution || ''}
                                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                    placeholder="University/School name"
                                  />
                                </div>
                                <div>
                                  <Label>Degree</Label>
                                  <Input
                                    value={edu.degree || ''}
                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                    placeholder="Bachelor's, Master's, etc."
                                  />
                                </div>
                                <div>
                                  <Label>Field of Study</Label>
                                  <Input
                                    value={edu.field || ''}
                                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                    placeholder="Computer Science, Business, etc."
                                  />
                                </div>
                                <div>
                                  <Label>GPA (Optional)</Label>
                                  <Input
                                    value={edu.gpa || ''}
                                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                    placeholder="3.8/4.0"
                                  />
                                </div>
                                <div>
                                  <Label>Start Date</Label>
                                  <Input
                                    type="date"
                                    value={edu.startDate || ''}
                                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    type="date"
                                    value={edu.endDate || ''}
                                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={edu.description || ''}
                                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                                    placeholder="Relevant coursework, achievements, etc."
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end mt-4">
                                <Button
                                  onClick={() => removeEducation(index)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No education entries yet</p>
                          <p className="text-sm">Click "Add Education" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <Briefcase className="h-5 w-5 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                      </div>
                      <Button onClick={addExperience} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {Array.isArray(form.experienceHistory) && form.experienceHistory.length > 0 ? (
                        form.experienceHistory.map((exp, index) => (
                          <Card key={index} className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Company</Label>
                                  <Input
                                    value={exp.company || ''}
                                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                    placeholder="Company name"
                                  />
                                </div>
                                <div>
                                  <Label>Position</Label>
                                  <Input
                                    value={exp.position || ''}
                                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                    placeholder="Job title"
                                  />
                                </div>
                                <div>
                                  <Label>Start Date</Label>
                                  <Input
                                    type="date"
                                    value={exp.startDate || ''}
                                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input
                                    type="date"
                                    value={exp.endDate || ''}
                                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                    disabled={exp.current}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <input
                                      type="checkbox"
                                      id={`current-${index}`}
                                      checked={exp.current || false}
                                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                      className="rounded border-gray-300"
                                    />
                                    <Label htmlFor={`current-${index}`} className="text-sm">
                                      I currently work here
                                    </Label>
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={exp.description || ''}
                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                    placeholder="Describe your responsibilities and achievements..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end mt-4">
                                <Button
                                  onClick={() => removeExperience(index)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No work experience entries yet</p>
                          <p className="text-sm">Click "Add Experience" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-pink-100">
                        <Globe className="h-5 w-5 text-pink-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Social Links & Portfolio</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                          id="linkedin"
                          name="linkedin"
                          value={form.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input
                          id="github"
                          name="github"
                          value={form.github}
                          onChange={handleChange}
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Personal Website</Label>
                        <Input
                          id="website"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portfolio">Portfolio</Label>
                        <Input
                          id="portfolio"
                          name="portfolio"
                          value={form.portfolio}
                          onChange={handleChange}
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          id="twitter"
                          name="twitter"
                          value={form.twitter}
                          onChange={handleChange}
                          placeholder="https://twitter.com/yourusername"
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          name="instagram"
                          value={form.instagram}
                          onChange={handleChange}
                          placeholder="https://instagram.com/yourusername"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-teal-100">
                        <FileText className="h-5 w-5 text-teal-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
                    </div>
                    
                    {/* Resume Upload with Cloudinary Integration (lazy) */}
                    <Suspense fallback={<div className="text-sm text-gray-500">Loading resume tools…</div>}>
                      <ResumeUpload 
                        onUploadSuccess={(resumeUrl) => {
                          setForm(prev => ({ ...prev, resume: resumeUrl }));
                          calculateProfileCompletion({ ...form, resume: resumeUrl });
                        }}
                        onDelete={() => {
                          setForm(prev => ({ ...prev, resume: '' }));
                          calculateProfileCompletion({ ...form, resume: '' });
                        }}
                        currentResumeUrl={form.resume}
                      />
                    </Suspense>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
