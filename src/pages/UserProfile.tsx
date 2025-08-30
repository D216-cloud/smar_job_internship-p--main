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
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              <p className="text-gray-600">Save your information to the database</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={viewSavedData} 
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Saved Data
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                <AvatarImage src={profileData.profilePicture} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  {profileData.firstName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                  <p className="text-gray-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profileData.email || '—'}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Applications Applied: <span className="font-semibold ml-1">{profileData.applicationCount ?? 0}</span>
                  </p>
                </div>
                {profileData.currentPosition && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Briefcase className="h-3 w-3" />
                    {profileData.currentPosition} at {profileData.currentCompany}
                  </p>
                )}
                <div className="mt-2">
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
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Personal Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-blue-100">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Login Email (auto-fetched) *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
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
                      value={profileData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      placeholder="City, State, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expectedSalary">Expected Salary</Label>
                    <Input
                      id="expectedSalary"
                      name="expectedSalary"
                      value={profileData.expectedSalary}
                      onChange={handleChange}
                      placeholder="$50,000 - $70,000"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-green-100">
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Professional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="currentPosition" className="text-sm">Current Position</Label>
                    <Input
                      id="currentPosition"
                      name="currentPosition"
                      value={profileData.currentPosition}
                      onChange={handleChange}
                      placeholder="Software Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input
                      id="currentCompany"
                      name="currentCompany"
                      value={profileData.currentCompany}
                      onChange={handleChange}
                      placeholder="Tech Company Inc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      name="experience"
                      value={profileData.experience}
                      onChange={handleChange}
                      placeholder="3 years"
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      name="education"
                      value={profileData.education}
                      onChange={handleChange}
                      placeholder="Bachelor's in Computer Science"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleChange}
                      placeholder="JavaScript, React, Node.js, Python, AWS..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-purple-100">
                    <Globe className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Social Links</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="linkedin"
                        name="linkedin"
                        value={profileData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="github"
                        name="github"
                        value={profileData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/yourusername"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="twitter"
                        name="twitter"
                        value={profileData.twitter}
                        onChange={handleChange}
                        placeholder="https://twitter.com/yourusername"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Personal Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        name="website"
                        value={profileData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents - Resume Upload */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeUpload currentResumeUrl={profileData.resume || undefined} />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-2 mt-2">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 rounded-lg shadow-md"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving to Database...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes to Database
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 