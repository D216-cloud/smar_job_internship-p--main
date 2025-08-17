import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Upload, 
  Save, 
  LogOut, 
  Edit, 
  Award, 
  Briefcase, 
  Users, 
  FileText, 
  Target, 
  CheckCircle, 
  Clock, 
  Star,
  Calendar,
  ExternalLink,
  Camera,
  Settings,
  Sparkles,
  TrendingUp,
  Heart,
  MessageSquare,
  Bell,
  ArrowLeft,
  ArrowRight,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Plus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CompanyProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  description?: string;
  logo?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  foundedYear?: string;
  revenue?: string;
  employeeCount?: number;
  benefits?: string[];
  technologies?: string[];
  companyType?: string;
  remotePolicy?: string;
  createdAt: string;
}

const CompanyProfile = () => {
  const { userData, logout } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced form state
  const [form, setForm] = useState<CompanyProfile>({
    _id: '',
    name: '',
    email: '',
    phone: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    description: '',
    logo: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    foundedYear: '',
    revenue: '',
    employeeCount: 0,
    benefits: [],
    technologies: [],
    companyType: '',
    remotePolicy: '',
    createdAt: ''
  });

  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/company/login');
        return;
      }

      console.log('🔍 Fetching company profile...');
      console.log('Token:', token ? 'Present' : 'Missing');

      // Fetch company profile
      const profileRes = await fetch('/api/company-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile response status:', profileRes.status);
      
      let profileData;
      if (profileRes.ok) {
        profileData = await profileRes.json();
        console.log('Profile data received:', profileData);
        setForm(profileData);
        setLogoPreview(profileData.logo || '');
        calculateProfileCompletion(profileData);
      } else {
        console.error('Failed to fetch profile:', profileRes.status, profileRes.statusText);
        const errorText = await profileRes.text();
        console.error('Error response:', errorText);
      }

      // Fetch job count
      const jobsRes = await fetch('/api/jobs/company/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        setJobCount(jobs.length || 0);
      }

      // Fetch application count
      if (profileData?._id) {
        const appsRes = await fetch(`/api/applications/company/${profileData._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (appsRes.ok) {
          const apps = await appsRes.json();
          setApplicationCount(apps.length || 0);
        }
      }

    } catch (error) {
      console.error('Error fetching company profile:', error);
      toast({
        title: "Error",
        description: "Failed to load company profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (profileData: CompanyProfile) => {
    let completed = 0;
    let total = 0;

    // Basic Information
    if (profileData.name) completed++;
    if (profileData.email) completed++;
    if (profileData.phone) completed++;
    if (profileData.location) completed++;
    total += 4;

    // Company Information
    if (profileData.industry) completed++;
    if (profileData.size) completed++;
    if (profileData.description) completed++;
    if (profileData.website) completed++;
    total += 4;

    // Social Links
    if (profileData.linkedin) completed++;
    if (profileData.twitter) completed++;
    if (profileData.facebook) completed++;
    total += 3;

    // Additional Information
    if (profileData.logo) completed++;
    if (profileData.foundedYear) completed++;
    if (profileData.employeeCount) completed++;
    if (profileData.technologies && profileData.technologies.length > 0) completed++;
    total += 4;

    setProfileCompletion(Math.round((completed / total) * 100));
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setForm(prev => ({ ...prev, logo: reader.result as string }));
        calculateProfileCompletion({ ...form, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Saving company profile...');
      console.log('Form data:', form);
      
      const res = await fetch('/api/company-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      
      console.log('Save response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Company profile saved successfully to MongoDB:', data);
        toast({
          title: "Profile Updated!",
          description: "Your company profile has been successfully saved to MongoDB database.",
          variant: "default",
        });
        alert(`Company profile saved successfully to MongoDB database!\n\nSaved data:\n- Company Name: ${form.name}\n- Email: ${form.email}\n- Phone: ${form.phone || 'Not provided'}\n- Website: ${form.website || 'Not provided'}\n- Location: ${form.location || 'Not provided'}\n- Industry: ${form.industry || 'Not provided'}\n- Size: ${form.size || 'Not provided'}\n- Description: ${form.description || 'Not provided'}\n- LinkedIn: ${form.linkedin || 'Not provided'}\n- Twitter: ${form.twitter || 'Not provided'}\n- Facebook: ${form.facebook || 'Not provided'}\n- Instagram: ${form.instagram || 'Not provided'}`);
      } else {
        console.error('Failed to save profile:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('Error response:', errorText);
        toast({
          title: "Update Failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving company profile:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
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
              <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
              <p className="text-gray-600">Manage your company information and branding</p>
            </div>
          </div>
          <Button
            onClick={logout} 
            variant="outline" 
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Profile Completion Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-purple-50/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                  <p className="text-sm text-gray-600">Complete your profile to attract better candidates</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{profileCompletion}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
            <Progress value={profileCompletion} className="mt-4 h-3 bg-purple-100" />
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${form.name ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={form.name ? 'text-gray-700' : 'text-gray-400'}>Company Name</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${form.description ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={form.description ? 'text-gray-700' : 'text-gray-400'}>Description</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${form.website ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={form.website ? 'text-gray-700' : 'text-gray-400'}>Website</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${form.logo ? 'text-green-500' : 'text-gray-300'}`} />
                <span className={form.logo ? 'text-gray-700' : 'text-gray-400'}>Logo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                      <AvatarImage src={logoPreview} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                        {form.name?.[0]?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleLogoChange}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center">
                    {form.name || 'Company Name'}
                  </h3>
                  <p className="text-gray-600 text-sm text-center">{form.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {jobCount} jobs posted
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {applicationCount} applications
                    </span>
                  </div>
                </div>

                {/* Company Stats */}
                <div className="space-y-4 mb-6">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{jobCount}</div>
                    <div className="text-xs text-gray-600">Active Jobs</div>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{applicationCount}</div>
                    <div className="text-xs text-gray-600">Total Applications</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/company/post-job')} 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Job
                  </Button>
                  <Button 
                    onClick={() => navigate('/company/candidates')} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Candidates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Building className="h-5 w-5 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Company Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Enter your company name"
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
                          placeholder="company@example.com"
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
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          name="website"
                          value={form.website}
                          onChange={handleChange}
                          placeholder="https://yourcompany.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          name="location"
                          value={form.location}
                          onChange={handleChange}
                          placeholder="City, State, Country"
                        />
                      </div>
                      <div>
                        <Label htmlFor="industry">Industry *</Label>
                        <Input
                          id="industry"
                          name="industry"
                          value={form.industry}
                          onChange={handleChange}
                          placeholder="Technology, Healthcare, Finance..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="size">Company Size *</Label>
                        <Select value={form.size} onValueChange={(value) => handleSelectChange('size', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="foundedYear">Founded Year</Label>
                        <Input
                          id="foundedYear"
                          name="foundedYear"
                          value={form.foundedYear}
                          onChange={handleChange}
                          placeholder="2020"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="description">Company Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Tell us about your company, mission, values, and what makes you unique..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Globe className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Social Links</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="linkedin"
                            name="linkedin"
                            value={form.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/company/yourcompany"
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
                            value={form.twitter}
                            onChange={handleChange}
                            placeholder="https://twitter.com/yourcompany"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="facebook"
                            name="facebook"
                            value={form.facebook}
                            onChange={handleChange}
                            placeholder="https://facebook.com/yourcompany"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="instagram"
                            name="instagram"
                            value={form.instagram}
                            onChange={handleChange}
                            placeholder="https://instagram.com/yourcompany"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Settings className="h-5 w-5 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="companyType">Company Type</Label>
                        <Select value={form.companyType} onValueChange={(value) => handleSelectChange('companyType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="sme">Small & Medium Enterprise</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                            <SelectItem value="nonprofit">Non-profit</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="remotePolicy">Remote Work Policy</Label>
                        <Select value={form.remotePolicy} onValueChange={(value) => handleSelectChange('remotePolicy', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select remote policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remote">Fully Remote</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="onsite">On-site Only</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="revenue">Annual Revenue</Label>
                        <Input
                          id="revenue"
                          name="revenue"
                          value={form.revenue}
                          onChange={handleChange}
                          placeholder="$1M - $10M"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employeeCount">Employee Count</Label>
                        <Input
                          id="employeeCount"
                          name="employeeCount"
                          type="number"
                          value={form.employeeCount}
                          onChange={handleChange}
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="mt-6 flex gap-4">
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/company/dashboard')}
                className="px-6"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile; 