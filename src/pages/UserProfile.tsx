import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Save, 
  ArrowLeft,
  CheckCircle,
  Calendar,
  Globe,
  Linkedin,
  Github,
  Twitter,
  FileText,
  Award,
  Star,
  Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import ResumeUpload from '@/components/ResumeUpload';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  applicationCount?: number;
  phone?: string;
  location?: string;
  currentPosition?: string;
  currentCompany?: string;
  experience?: string;
  education?: string;
  skills?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  expectedSalary?: string;
  resume?: string;
  profilePicture?: string;
  createdAt: string;
}

type TabType = 'personal' | 'professional' | 'education' | 'experience' | 'social' | 'documents';

const UserProfile = () => {
  const { userData } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [profileData, setProfileData] = useState<UserProfile>({
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
  applicationCount: 0,
    phone: '',
    location: '',
    currentPosition: '',
    currentCompany: '',
    experience: '',
    education: '',
    skills: '',
    bio: '',
    linkedin: '',
    github: '',
    twitter: '',
    website: '',
    expectedSalary: '',
    resume: '',
    profilePicture: '',
    createdAt: ''
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch user profile from new backend endpoint
      const response = await axios.get('/api/user-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.patch('/api/user-profile', profileData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        toast({
          title: "Profile Updated!",
          description: "Your profile has been successfully saved to the database.",
          variant: "default",
        });
        
        // Show the saved data
        console.log('Saved profile data:', response.data);
        alert(`Profile saved successfully!\n\nSaved data:\n- Name: ${profileData.firstName} ${profileData.lastName}\n- Email: ${profileData.email}\n- Phone: ${profileData.phone || 'Not provided'}\n- Location: ${profileData.location || 'Not provided'}\n- Current Position: ${profileData.currentPosition || 'Not provided'}\n- Experience: ${profileData.experience || 'Not provided'}\n- Skills: ${profileData.skills || 'Not provided'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const viewSavedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data;
      alert(`Current Profile Data in Database:\n\n- Name: ${data.firstName} ${data.lastName}\n- Email: ${data.email}\n- Phone: ${data.phone || 'Not provided'}\n- Location: ${data.location || 'Not provided'}\n- Current Position: ${data.currentPosition || 'Not provided'}\n- Current Company: ${data.currentCompany || 'Not provided'}\n- Experience: ${data.experience || 'Not provided'}\n- Education: ${data.education || 'Not provided'}\n- Skills: ${data.skills || 'Not provided'}\n- Expected Salary: ${data.expectedSalary || 'Not provided'}\n- LinkedIn: ${data.linkedin || 'Not provided'}\n- GitHub: ${data.github || 'Not provided'}\n- Website: ${data.website || 'Not provided'}`);
    } catch (error) {
      console.error('Error fetching saved data:', error);
      alert('Error fetching saved data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full hover:bg-white/50 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your personal information</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button 
              onClick={viewSavedData} 
              variant="outline"
              className="flex-1 sm:flex-none bg-green-50 text-green-700 border-green-200 hover:bg-green-100 h-10 sm:h-11 text-sm font-medium"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">View Saved Data</span>
              <span className="sm:hidden">View Data</span>
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            {/* Mobile-first profile header */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
              <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-3 border-white shadow-lg">
                  <AvatarImage src={profileData.profilePicture} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    {profileData.firstName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="sm:text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfileData(prev => ({ ...prev, profilePicture: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 text-xs font-medium bg-white/50 hover:bg-white/80 transition-all duration-200"
                  >
                    <Edit className="h-3 w-3 mr-1.5" />
                    Change Photo
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{profileData.email || '—'}</span>
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span>Applications: <span className="font-semibold">{profileData.applicationCount ?? 0}</span></span>
                    </p>
                  </div>
                  {profileData.currentPosition && (
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Briefcase className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{profileData.currentPosition} at {profileData.currentCompany}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-100 shadow-sm">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        className="h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        className="h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">Login Email (auto-fetched) *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      disabled
                      className="h-11 text-base bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      placeholder="City, State, Country"
                      className="h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedSalary" className="text-sm font-medium text-gray-700 mb-2 block">Expected Salary</Label>
                    <Input
                      id="expectedSalary"
                      name="expectedSalary"
                      value={profileData.expectedSalary}
                      onChange={handleChange}
                      placeholder="$50,000 - $70,000"
                      className="h-11 text-base border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-green-100 shadow-sm">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Professional Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentPosition" className="text-sm font-medium text-gray-700 mb-2 block">Current Position</Label>
                      <Input
                        id="currentPosition"
                        name="currentPosition"
                        value={profileData.currentPosition}
                        onChange={handleChange}
                        placeholder="Software Developer"
                        className="h-11 text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentCompany" className="text-sm font-medium text-gray-700 mb-2 block">Current Company</Label>
                      <Input
                        id="currentCompany"
                        name="currentCompany"
                        value={profileData.currentCompany}
                        onChange={handleChange}
                        placeholder="Tech Company Inc."
                        className="h-11 text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience" className="text-sm font-medium text-gray-700 mb-2 block">Years of Experience</Label>
                      <Input
                        id="experience"
                        name="experience"
                        value={profileData.experience}
                        onChange={handleChange}
                        placeholder="3 years"
                        className="h-11 text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="education" className="text-sm font-medium text-gray-700 mb-2 block">Education</Label>
                      <Input
                        id="education"
                        name="education"
                        value={profileData.education}
                        onChange={handleChange}
                        placeholder="Bachelor's in Computer Science"
                        className="h-11 text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="skills" className="text-sm font-medium text-gray-700 mb-2 block">Skills</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleChange}
                      placeholder="JavaScript, React, Node.js, Python, AWS..."
                      className="h-11 text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700 mb-2 block">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      rows={4}
                      className="text-base border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-purple-100 shadow-sm">
                    <Globe className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Social Links</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700 mb-2 block">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="linkedin"
                        name="linkedin"
                        value={profileData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="h-11 pl-10 text-base border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-sm font-medium text-gray-700 mb-2 block">GitHub</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="github"
                        name="github"
                        value={profileData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/yourusername"
                        className="h-11 pl-10 text-base border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-sm font-medium text-gray-700 mb-2 block">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="twitter"
                        name="twitter"
                        value={profileData.twitter}
                        onChange={handleChange}
                        placeholder="https://twitter.com/yourusername"
                        className="h-11 pl-10 text-base border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-sm font-medium text-gray-700 mb-2 block">Personal Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        name="website"
                        value={profileData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="h-11 pl-10 text-base border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents - Resume Upload */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
              <div className="p-2 rounded-xl bg-indigo-100 shadow-sm">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              Resume & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResumeUpload currentResumeUrl={profileData.resume || undefined} />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex-1 h-12 sm:h-13 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Saving to Database...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-3" />
                Save Changes to Database
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="h-12 sm:h-13 px-6 sm:px-8 text-base font-medium border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 