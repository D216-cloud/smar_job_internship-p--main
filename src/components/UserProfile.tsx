import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { User, FileText, Download, Upload, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import ResumeUpload from './ResumeUpload';

interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  resumeUrl?: string;
}

const UserProfile = () => {
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [currentResume, setCurrentResume] = useState<string | null>(null);
  const { userData } = useAuthContext();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch user profile
      const profileResponse = await fetch('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      setProfile({
        firstName: profileData.user.firstName,
        lastName: profileData.user.lastName || '',
        email: profileData.user.email,
        resumeUrl: profileData.user.resumeUrl
      });

      // Fetch current resume
      const resumeResponse = await fetch('/api/resume/current', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (resumeResponse.ok) {
        const resumeData = await resumeResponse.json();
        setCurrentResume(resumeData.data.resumeUrl);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeUploadSuccess = (resumeUrl: string) => {
    setCurrentResume(resumeUrl);
    fetchProfile(); // Refresh the profile data
  };

  const handleResumeDelete = () => {
    setCurrentResume(null);
    fetchProfile(); // Refresh the profile data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-8 w-8" />
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </div>

              <Button type="submit" disabled={updating} className="w-full">
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resume Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentResume ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Resume uploaded successfully
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(currentResume, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Upload a new resume to replace the current one.
                </div>
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No resume uploaded</p>
                <p className="text-sm text-gray-500">
                  Upload your resume to improve job matching
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resume Upload Component */}
      <ResumeUpload 
        onUploadSuccess={handleResumeUploadSuccess}
        onDelete={handleResumeDelete}
        currentResumeUrl={currentResume}
      />
    </div>
  );
};

export default UserProfile;
