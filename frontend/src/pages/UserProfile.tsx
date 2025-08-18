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
  Edit,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import ResumeUpload from '@/components/ResumeUpload';
import ProfileResume from '../components/ProfileResume';

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
    createdAt: '',
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/user-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
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
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [name]: value }));
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
          title: 'Profile Updated!',
          description: 'Your profile has been successfully saved.',
          variant: 'default',
        });

        console.log('Saved profile data:', response.data);
        alert(`Profile saved successfully!\n\nSaved data:\n- Name: ${profileData.firstName} ${profileData.lastName}\n- Email: ${profileData.email}\n- Phone: ${profileData.phone || 'Not provided'}\n- Location: ${profileData.location || 'Not provided'}\n- Current Position: ${profileData.currentPosition || 'Not provided'}\n- Experience: ${profileData.experience || 'Not provided'}\n- Skills: ${profileData.skills || 'Not provided'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  const viewSavedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user-profile', {
        headers: { Authorization: `Bearer ${token}` },
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* === Header === */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600">Complete your details to boost your job match potential</p>
            </div>
          </div>
          <Button
            onClick={viewSavedData}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 text-sm font-medium px-4 py-2 rounded-xl"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Saved Data
          </Button>
        </div>

        {/* === Profile Summary Card === */}
        <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex items-center gap-5">
                <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                  <AvatarImage src={profileData.profilePicture} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                    {profileData.firstName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-gray-600 mt-1">{profileData.email}</p>
                  {profileData.currentPosition && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {profileData.currentPosition} at {profileData.currentCompany}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    Applied to <span className="font-semibold text-blue-600">{profileData.applicationCount ?? 0}</span> jobs
                  </div>
                </div>
              </div>

              <div className="ml-auto md:mt-0 mt-4">
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
                      setProfileData((prev) => ({ ...prev, profilePicture: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-gray-200 hover:bg-gray-50 text-sm font-medium"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === Form Grid === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Personal Info */}
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 shadow-sm">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Personal Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled
                  className="rounded-lg bg-gray-50 border-gray-200 text-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="rounded-lg border-gray-200 focus:border-green-500"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA"
                  className="rounded-lg border-gray-200 focus:border-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="expectedSalary">Expected Salary</Label>
                <Input
                  id="expectedSalary"
                  name="expectedSalary"
                  value={profileData.expectedSalary}
                  onChange={handleChange}
                  placeholder="$70,000 - $90,000"
                  className="rounded-lg border-gray-200 focus:border-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-100 shadow-sm">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Professional Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input
                  id="currentPosition"
                  name="currentPosition"
                  value={profileData.currentPosition}
                  onChange={handleChange}
                  placeholder="Senior Frontend Developer"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  name="currentCompany"
                  value={profileData.currentCompany}
                  onChange={handleChange}
                  placeholder="Tech Innovations Inc."
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleChange}
                  placeholder="5 years"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  name="education"
                  value={profileData.education}
                  onChange={handleChange}
                  placeholder="M.S. in Computer Science"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={profileData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, TypeScript, AWS"
                  className="rounded-lg border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your journey, expertise, and career goals..."
                  rows={4}
                  className="rounded-lg border-gray-200 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 shadow-sm">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-800">Social Links</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                  <Input
                    id="linkedin"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleChange}
                    placeholder="linkedin.com/in/yourprofile"
                    className="pl-10 rounded-lg border-gray-200"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-gray-700" />
                  <Input
                    id="github"
                    name="github"
                    value={profileData.github}
                    onChange={handleChange}
                    placeholder="github.com/yourusername"
                    className="pl-10 rounded-lg border-gray-200"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="twitter">Twitter / X</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-700" />
                  <Input
                    id="twitter"
                    name="twitter"
                    value={profileData.twitter}
                    onChange={handleChange}
                    placeholder="twitter.com/yourusername"
                    className="pl-10 rounded-lg border-gray-200"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Personal Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-700" />
                  <Input
                    id="website"
                    name="website"
                    value={profileData.website}
                    onChange={handleChange}
                    placeholder="yourwebsite.com"
                    className="pl-10 rounded-lg border-gray-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === Resume Upload Section === */}
        <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <FileText className="h-5 w-5 text-blue-600" />
              Resume & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResumeUpload currentResumeUrl={profileData.resume || undefined} />
            <ProfileResume />
          </CardContent>
        </Card>

        {/* === Save Button === */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes to Database
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
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