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
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Github, 
  Globe, 
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
  Camera,
  Settings,
  Sparkles,
  TrendingUp,
  Heart,
  MessageSquare,
  Bell,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  UploadCloud,
  CheckSquare,
} from 'lucide-react';

// Lazy-load heavy resume management to speed initial profile render
const ResumeUpload = React.lazy(() => import('@/components/ResumeUpload'));

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

const UserProfile = () => {
  const { userData, logout } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
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
  const [expandedSections, setExpandedSections] = useState<{
    personal: boolean;
    professional: boolean;
    skills: boolean;
    education: boolean;
    experience: boolean;
    social: boolean;
    documents: boolean;
  }>({
    personal: true,
    professional: true,
    skills: true,
    education: true,
    experience: true,
    social: true,
    documents: true,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` } as HeadersInit;

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

  const calculateProfileCompletion = (profileData: typeof form) => {
    const sections = {
      personalInfo: Boolean(profileData.firstName && profileData.lastName && profileData.email),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    calculateProfileCompletion({ ...form, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
    calculateProfileCompletion({ ...form, [name]: value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setForm(prev => ({ ...prev, avatar: reader.result as string }));
        calculateProfileCompletion({ ...form, avatar: reader.result as string });
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

      // Save personal information
      const personalInfoData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        location: form.location
      };
      const personalRes = await fetch('/api/user-profile/personal-info', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(personalInfoData),
      });
      if (personalRes.ok) saveResults.personal = true;

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
      const professionalRes = await fetch('/api/user-profile/professional-bio', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(professionalBioData),
      });
      if (professionalRes.ok) saveResults.professional = true;

      // Save skills
      const skillsData = {
        technicalSkills: form.skills,
        softSkills: '',
        languages: form.languages || [],
        certifications: form.certifications || []
      };
      const skillsRes = await fetch('/api/user-profile/skills', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(skillsData),
      });
      if (skillsRes.ok) saveResults.skills = true;

      // Save education history
      const educationData = {
        educationHistory: form.education || []
      };
      const educationRes = await fetch('/api/user-profile/education', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(educationData),
      });
      if (educationRes.ok) saveResults.education = true;

      // Save experience history
      const experienceData = {
        experienceHistory: form.experienceHistory || []
      };
      const experienceRes = await fetch('/api/user-profile/experience', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(experienceData),
      });
      if (experienceRes.ok) saveResults.experience = true;

      // Save documents (resume URL if available)
      if (form.resume) {
        const documentsData = {
          resumeUrl: form.resume,
          resumeUploadDate: new Date().toISOString()
        };
        const documentsRes = await fetch('/api/user-profile/resume', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(documentsData),
        });
        if (documentsRes.ok) saveResults.documents = true;
      } else {
        saveResults.documents = true;
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
      const socialRes = await fetch('/api/user-profile/social-links', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(socialLinksData),
      });
      if (socialRes.ok) saveResults.social = true;

      // Save profile picture
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

      // Show result
      const successCount = Object.values(saveResults).filter(Boolean).length;
      const totalCount = Object.keys(saveResults).length;

      if (successCount === totalCount) {
        toast({
          title: "✅ Profile Saved Successfully!",
          description: `All profile sections have been saved to MongoDB database.`,
          variant: "default",
        });
        await fetchCompletionStatus();
      } else if (successCount > 0) {
        toast({
          title: "⚠️ Partially Saved",
          description: `${successCount}/${totalCount} sections saved successfully.`,
          variant: "default",
        });
      } else {
        toast({
          title: "❌ Save Failed",
          description: "Unable to save profile data. Please check your connection.",
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
        alert(`Current Profile Data in Database:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.email}
- Phone: ${data.phone || 'Not provided'}
- Location: ${data.location || 'Not provided'}
- Current Position: ${data.currentPosition || 'Not provided'}
- Current Company: ${data.currentCompany || 'Not provided'}
- Experience: ${data.experience || 'Not provided'}
- Education: ${data.education || 'Not provided'}
- Skills: ${data.skills || 'Not provided'}
- Expected Salary: ${data.expectedSalary || 'Not provided'}
- LinkedIn: ${data.linkedin || 'Not provided'}
- GitHub: ${data.github || 'Not provided'}
- Website: ${data.website || 'Not provided'}
- Bio: ${data.bio || 'Not provided'}`);
      } else {
        alert('Error fetching saved data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching saved ', error);
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

  const updateEducation = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      experienceHistory: (Array.isArray(prev.experienceHistory) ? prev.experienceHistory : []).map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeEducation = (index: number) => {
    setForm(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeExperience = (index: number) => {
    setForm(prev => ({
      ...prev,
      experienceHistory: (Array.isArray(prev.experienceHistory) ? prev.experienceHistory : []).filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full p-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Complete your profile to stand out</p>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={viewSavedData}
            className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
          >
            <Eye className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-24">
        {/* Profile Completion Ring */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <svg width="100" height="100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={`${(profileCompletion / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {profileCompletion}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Profile Completion</p>
        </div>

        {/* Avatar Section */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl mb-8 overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg mx-auto">
                <AvatarImage src={avatarPreview} />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {form.firstName?.[0]?.toUpperCase() || form.lastName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </Button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              {form.firstName} {form.lastName}
            </h2>
            <p className="text-gray-600 text-sm">{form.email}</p>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <span>{appliedCount} apps</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{userData?.role || 'User'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="p-6 cursor-pointer" onClick={() => toggleSection('personal')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.personal ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSections.personal && (
              <CardContent className="pt-0 px-6 pb-6 space-y-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    disabled
                    className="h-12 text-base bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State, Country"
                    className="h-12 text-base"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Professional Information */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="p-6 cursor-pointer" onClick={() => toggleSection('professional')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-100">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.professional ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSections.professional && (
              <CardContent className="pt-0 px-6 pb-6 space-y-4">
                <div>
                  <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                    rows={4}
                    className="h-32 text-base resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentPosition" className="text-sm font-medium text-gray-700">Current Position</Label>
                    <Input
                      id="currentPosition"
                      name="currentPosition"
                      value={form.currentPosition}
                      onChange={handleChange}
                      placeholder="e.g., Senior Software Engineer"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentCompany" className="text-sm font-medium text-gray-700">Current Company</Label>
                    <Input
                      id="currentCompany"
                      name="currentCompany"
                      value={form.currentCompany}
                      onChange={handleChange}
                      placeholder="e.g., Tech Corp Inc."
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Years of Experience</Label>
                    <Select value={form.experience} onValueChange={(value) => handleSelectChange('experience', value)}>
                      <SelectTrigger className="h-12 text-base">
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
                    <Label htmlFor="expectedSalary" className="text-sm font-medium text-gray-700">Expected Salary</Label>
                    <Input
                      id="expectedSalary"
                      name="expectedSalary"
                      value={form.expectedSalary}
                      onChange={handleChange}
                      placeholder="e.g., $80,000 - $100,000"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="availability" className="text-sm font-medium text-gray-700">Availability</Label>
                    <Select value={form.availability} onValueChange={(value) => handleSelectChange('availability', value)}>
                      <SelectTrigger className="h-12 text-base">
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
                    <Label htmlFor="remotePreference" className="text-sm font-medium text-gray-700">Work Preference</Label>
                    <Select value={form.remotePreference} onValueChange={(value) => handleSelectChange('remotePreference', value)}>
                      <SelectTrigger className="h-12 text-base">
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
                  <Label htmlFor="interests" className="text-sm font-medium text-gray-700">Interests & Goals</Label>
                  <Textarea
                    id="interests"
                    name="interests"
                    value={form.interests}
                    onChange={handleChange}
                    placeholder="What are your career interests and goals?"
                    rows={3}
                    className="h-24 text-base resize-none"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Skills & Qualifications */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="p-6 cursor-pointer" onClick={() => toggleSection('skills')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Skills & Qualifications</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSections.skills && (
              <CardContent className="pt-0 px-6 pb-6 space-y-4">
                <div>
                  <Label htmlFor="skills" className="text-sm font-medium text-gray-700">Technical Skills</Label>
                  <Textarea
                    id="skills"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="List your technical skills (e.g., JavaScript, React, Node.js, Python, SQL...)"
                    rows={4}
                    className="h-32 text-base resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Languages</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.languages && form.languages.length > 0 ? (
                        form.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-50 text-purple-700 text-sm">
                            {lang}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No languages added yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Certifications</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {form.certifications && form.certifications.length > 0 ? (
                        form.certifications.map((cert, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 text-sm">
                            {cert}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No certifications added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Education */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="p-6 cursor-pointer" onClick={() => toggleSection('education')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-100">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.education ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSections.education && (
              <CardContent className="pt-0 px-6 pb-6 space-y-4">
                {form.education && form.education.length > 0 ? (
                  form.education.map((edu, index) => (
                    <Card key={index} className="border border-gray-200 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution || ''}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            placeholder="University/School name"
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree || ''}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            placeholder="Bachelor's, Master's, etc."
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>Field of Study</Label>
                          <Input
                            value={edu.field || ''}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            placeholder="Computer Science, Business, etc."
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>GPA (Optional)</Label>
                          <Input
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={edu.startDate || ''}
                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={edu.endDate || ''}
                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Description</Label>
                          <Textarea
                            value={edu.description || ''}
                            onChange={(e) => updateEducation(index, 'description', e.target.value)}
                            placeholder="Relevant coursework, achievements, etc."
                            rows={2}
                            className="h-20 text-sm resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={() => removeEducation(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-3 py-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No education entries yet</p>
                    <p className="text-sm">Tap “Add Education” below to get started</p>
                  </div>
                )}
                <Button
                  onClick={addEducation}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Work Experience */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="p-6 cursor-pointer" onClick={() => toggleSection('experience')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-100">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.experience ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSections.experience && (
              <CardContent className="pt-0 px-6 pb-6 space-y-4">
                {Array.isArray(form.experienceHistory) && form.experienceHistory.length > 0 ? (
                  form.experienceHistory.map((exp, index) => (
                    <Card key={index} className="border border-gray-200 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company || ''}
                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                            placeholder="Company name"
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>Position</Label>
                          <Input
                            value={exp.position || ''}
                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                            placeholder="Job title"
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={exp.startDate || ''}
                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={exp.endDate || ''}
                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                            disabled={exp.current}
                            className="h-10 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-2 mb-3">
                            <input
                              type="checkbox"
                              id={`current-${index}`}
                              checked={exp.current || false}
                              onChange={(e) => updateExperience(index, 'current', e.target.checked.toString())}
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
                            className="h-24 text-sm resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <Button
                          onClick={() => removeExperience(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-3 py-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No work experience entries yet</p>
                    <p className="text-sm">Tap “Add Experience” below to get started</p>
                  </div>
                )}
                <Button
                  onClick={addExperience}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Social Links */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="p-6 cursor-pointer" onClick={() => toggleSection('social')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-100">
                    <Globe className="h-5 w-5 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Social Links & Portfolio</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.social ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSections.social && (
              <CardContent className="pt-0 px-6 pb-6 space-y-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={form.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="h-12 text-base"
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
                    className="h-12 text-base"
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
                    className="h-12 text-base"
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
                    className="h-12 text-base"
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
                    className="h-12 text-base"
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
                    className="h-12 text-base"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Documents */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="p-6 cursor-pointer" onClick={() => toggleSection('documents')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-100">
                    <FileText className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${expandedSections.documents ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
            {expandedSections.documents && (
              <CardContent className="pt-0 px-6 pb-6">
                <Suspense fallback={<div className="text-sm text-gray-500 text-center py-8">Loading resume tools…</div>}>
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
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-4 z-40">
        <div className="max-w-7xl mx-auto flex gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-300"
          >
            {saving ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
