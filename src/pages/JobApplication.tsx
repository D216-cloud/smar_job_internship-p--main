import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Briefcase, 
  Sparkles, 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle, 
  Loader2,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  Award,
  Target,
  Star,
  CheckSquare,
  AlertCircle,
  Brain,
  Info
} from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import AIResumeMatching from '@/components/AIResumeMatching';

const JobApplication = () => {
  interface Job {
    id?: string;
    _id?: string;
    jobId?: string;
    title: string;
    company: string;
    companyId?: string;
    company_id?: string;
    location?: string;
    salary?: string;
    type?: string;
    description?: string;
    requirements?: string;
    postedBy?: string;
  }

  interface ApplicationData {
    jobId: string;
    companyId?: string;
    companyName: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    coverLetter: string;
    resume: string | File | null;
    linkedIn: string;
    portfolio: string;
    currentCompany: string;
    currentPosition: string;
    experience: string;
    skills: string;
    expectedSalary: string;
    startDate: string;
    status?: string;
    appliedAt?: string;
  }

  const { id } = useParams();
  const navigate = useNavigate();
  const { searchResults } = useSearch();
  const authContext = useAuthContext();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [currentResume, setCurrentResume] = useState<{ url?: string; fileName?: string; fileSize?: number; uploadDate?: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submittedData, setSubmittedData] = useState<ApplicationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const [showAIMatching, setShowAIMatching] = useState(false);

  // Enhanced Application form state
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resume: null as File | null,
    linkedIn: '',
    portfolio: '',
    currentCompany: '',
    currentPosition: '',
    experience: '',
    skills: '',
    expectedSalary: '',
    startDate: '',
  });

  const { userData, isAuthenticated, loading: authLoading, isTokenValid } = authContext || {};
  
  // Utility function to validate ObjectId format
  const isValidObjectId = (id: string) => {
    return id && /^[0-9a-fA-F]{24}$/.test(id);
  };
  
  // Function to generate random User ID
  const generateUserId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const userId = `USER_${timestamp}_${randomStr}`.toUpperCase();
    setFormData(prev => ({ ...prev, userId }));
  };

  // All useEffects at the top level
  useEffect(() => {
    if (!formData.userId) {
      generateUserId();
    }
  }, [formData.userId]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const all = await searchResults('');
        const found = all.find((j: Job) => j.id === id || j._id === id);
        
        if (!found) {
          setError('Job not found');
        } else {
          setJob(found);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        if (err instanceof Error && err.message.includes('401')) {
          setError('Authentication required. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
          localStorage.removeItem('userData');
          navigate('/login');
        } else {
          setError('Failed to load job details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && isAuthenticated) {
      fetchJob();
    } else if (id && !isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [id, searchResults, isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        fullName: userData?.firstName || (userData?.email ? userData.email.split('@')[0] : ''),
        email: userData?.email || '',
      }));
    }
  }, [userData]);

  // Fetch current saved resume metadata for default use
  useEffect(() => {
    const fetchCurrentResume = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/resume/current', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const payload = (data && (data.data || data)) as {
          resumeUrl?: string; fileUrl?: string; fileName?: string; fileSize?: number; uploadDate?: string
        } | undefined;
        if (payload && (payload.resumeUrl || payload.fileUrl)) {
          setCurrentResume({
            url: payload.resumeUrl || payload.fileUrl,
            fileName: payload.fileName,
            fileSize: payload.fileSize,
            uploadDate: payload.uploadDate,
          });
          if (!resumeName && payload.fileName) setResumeName(payload.fileName);
        }
      } catch (err) {
        console.warn('Failed to fetch current resume');
      }
    };
    if (isAuthenticated) fetchCurrentResume();
  }, [isAuthenticated, resumeName]);

  // Calculate form progress
  useEffect(() => {
    const filledFields = Object.values(formData).filter(value => 
      value && value.toString().trim() !== ''
    ).length;
    const totalFields = Object.keys(formData).length;
    setFormProgress(Math.round((filledFields / totalFields) * 100));
  }, [formData]);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md mx-auto shadow-xl animate-pulse">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoggedIn = isAuthenticated && userData && userData.email;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, resume: file }));
      setResumeName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast({ title: 'Authentication required', description: 'Please log in to apply for this job.', variant: 'destructive' });
      navigate('/login');
      return;
    }
    
    if (!isTokenValid || !isTokenValid(token)) {
      toast({ title: 'Session Expired', description: 'Please log in again to continue.', variant: 'destructive' });
      navigate('/login');
      return;
    }
    
    if (!isLoggedIn) {
      toast({ title: 'You must be logged in to apply for a job.', variant: 'destructive' });
      navigate('/login');
      return;
    }
    
    if (!job) {
      toast({ title: 'Job not found', variant: 'destructive' });
      return;
    }

    if (!formData.userId || formData.userId.trim() === '') {
      toast({ title: 'User ID Required', description: 'Please generate a User ID before submitting.', variant: 'destructive' });
      return;
    }

    const jobId = job.id || job._id || job.jobId;
    const companyId = job.companyId || job.company_id;
    const companyName = job.company || 'Unknown Company';
    
    let applicationResumeUrl: string | undefined = undefined;
    if (formData.resume && formData.resume instanceof File) {
      try {
        const fd = new FormData();
        fd.append('resume', formData.resume);
        const uploadRes = await fetch('/api/resume/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const uploadJson: unknown = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) {
          const u = uploadJson as { error?: string; message?: string } | undefined;
          const errMsg = (u && (u.error || u.message)) || uploadRes.statusText;
          toast({ title: 'Resume upload failed', description: errMsg, variant: 'destructive' });
          return;
        }
        let payload: { resumeUrl?: string; fileUrl?: string } | undefined;
        if (uploadJson && typeof uploadJson === 'object' && uploadJson !== null) {
          const maybe = uploadJson as Record<string, unknown>;
          const inner = (maybe.data && typeof maybe.data === 'object') ? (maybe.data as Record<string, unknown>) : maybe;
          payload = {
            resumeUrl: typeof inner.resumeUrl === 'string' ? inner.resumeUrl : undefined,
            fileUrl: typeof inner.fileUrl === 'string' ? inner.fileUrl : undefined,
          };
        }
        applicationResumeUrl = (payload && (payload.resumeUrl || payload.fileUrl)) || undefined;
      } catch (err) {
        toast({ title: 'Resume upload failed', description: 'Please try again.', variant: 'destructive' });
        return;
      }
    } else if (currentResume?.url) {
      applicationResumeUrl = currentResume.url;
    }

    if (!applicationResumeUrl) {
      toast({ title: 'Resume required', description: 'Please upload your resume in PDF/DOC format or save one in your profile.', variant: 'destructive' });
      return;
    }

    const applicationData = {
      jobId,
      companyId: companyId && isValidObjectId(companyId) ? companyId : undefined,
      companyName,
      userId: formData.userId,
      ...formData,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      resume: applicationResumeUrl,
    };
    
    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });
      
      if (res.status === 201) {
        toast({ title: 'Successfully applied for this job!', variant: 'default' });
        setSubmitted(true);
        setShowConfetti(true);
        setSubmittedData(applicationData);
        setTimeout(() => setShowConfetti(false), 2500);
      } else if (res.status === 409) {
        toast({ title: 'Already Applied', description: 'You have already applied to this job.', variant: 'default' });
      } else if (res.status === 401) {
        toast({ 
          title: 'Session Expired', 
          description: 'Please log in again to continue.', 
          variant: 'destructive' 
        });
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        navigate('/login');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast({ title: 'Failed to submit application', description: errorData.error || res.statusText, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Network Error', description: 'Failed to submit application. Please try again.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md mx-auto shadow-xl animate-pulse">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <div className="space-y-2">
                <p className="text-xl font-semibold text-gray-800">Loading job details...</p>
                <p className="text-sm text-gray-500">Please wait while we fetch the information</p>
              </div>
            </div>
            <div className="w-full mt-6 space-y-3">
              <div className="h-2.5 bg-gray-200 rounded-full w-3/4"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md mx-auto shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Try Again
              </Button>
              <Link to="/jobs">
                <Button variant="outline">Browse Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md mx-auto shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle>Job/Internship Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10 animate-fade-in">
            <div className="w-full h-full flex flex-wrap items-center justify-center opacity-80">
              {[...Array(30)].map((_, i) => (
                <span key={i} className={`absolute text-3xl select-none animate-bounce-slow`} style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                  animationDelay: `${Math.random()}s`,
                }}>🎉</span>
              ))}
            </div>
          </div>
        )}
        <Card className="max-w-md mx-auto shadow-xl z-20 animate-fade-in">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Sparkles className="h-12 w-12 text-green-500 mb-2 animate-bounce" />
              <CardTitle className="text-2xl font-bold text-green-700">Application Submitted!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-lg">Thank you for applying to <b>{job.title}</b> at <b>{job.company}</b>.</p>
            <div className="mb-4 text-left text-sm bg-gray-50 p-4 rounded-lg shadow-inner">
              <div className="font-semibold mb-2">Your Application Details:</div>
              <ul className="space-y-1">
                {submittedData && Object.entries(submittedData).map(([key, value]) => (
                  <li key={key}><b>{key}:</b> {value as string}</li>
                ))}
              </ul>
            </div>
            <Link to="/user/applications">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                View My Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto relative">
        <button
          onClick={() => setShowAIMatching(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 z-50 group"
        >
          <Brain className="h-5 w-5" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
            AI Resume Match
          </span>
        </button>
        
        <div className="p-4 border-b bg-white/80 backdrop-blur-sm">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
        
        <div className="flex h-[calc(100vh-120px)]">
          <div className="w-1/3 border-r bg-white/80 backdrop-blur-sm">
            <div className="p-6 h-full overflow-y-auto">
              <Card className="shadow-xl border-0 bg-white/90 animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                      {job.type && (
                        <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-700">
                          {job.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {job.description || 'No description available.'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {job.requirements || 'No requirements specified.'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Posted recently</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Multiple applicants</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="w-2/3 overflow-y-auto">
            <div className="p-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-fade-in">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Application Form
                      </CardTitle>
                      <p className="text-gray-600">Complete your application for <span className="font-medium text-gray-800">{job.title}</span> position</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Form Progress</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formProgress}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${formProgress}%` }}
                    />
                  </div>
                </CardHeader>

                <CardContent>
                  {!isLoggedIn ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
                      <p className="text-gray-600 mb-6">You must be logged in to apply for this position.</p>
                      <Link to="/login">
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                          Login to Apply
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-6 bg-white/50 p-6 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                            <p className="text-sm text-gray-500">Basic details for your application</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="userId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              User ID 
                              <span className="text-red-500">*</span>
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Required
                              </Badge>
                            </Label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  id="userId"
                                  name="userId"
                                  value={formData.userId}
                                  onChange={handleInputChange}
                                  required
                                  className="h-11 pl-10 pr-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                                  placeholder="User ID will be auto-generated"
                                  readOnly
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={generateUserId}
                                className="h-11 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate ID
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Unique identifier for tracking your application
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              required
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Enter your full name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Enter your email"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Enter your phone number"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Available Start Date</Label>
                            <Input
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-100">
                            <Briefcase className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="currentCompany" className="text-sm font-medium text-gray-700">Current Company</Label>
                            <Input
                              id="currentCompany"
                              name="currentCompany"
                              value={formData.currentCompany}
                              onChange={handleInputChange}
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Your current employer"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="currentPosition" className="text-sm font-medium text-gray-700">Current Position</Label>
                            <Input
                              id="currentPosition"
                              name="currentPosition"
                              value={formData.currentPosition}
                              onChange={handleInputChange}
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Your current role"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Years of Experience</Label>
                            <Input
                              id="experience"
                              name="experience"
                              type="number"
                              value={formData.experience}
                              onChange={handleInputChange}
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Number of years"
                              min="0"
                              max="50"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="expectedSalary" className="text-sm font-medium text-gray-700">Expected Salary</Label>
                            <Input
                              id="expectedSalary"
                              name="expectedSalary"
                              type="number"
                              value={formData.expectedSalary}
                              onChange={handleInputChange}
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="Annual salary expectation"
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="skills" className="text-sm font-medium text-gray-700">Skills & Technologies</Label>
                          <Input
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            onChange={handleInputChange}
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                            placeholder="e.g., React, TypeScript, Node.js, MongoDB"
                          />
                          <p className="text-xs text-gray-500">Separate skills with commas</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100">
                            <Globe className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Online Presence</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="linkedIn" className="text-sm font-medium text-gray-700">LinkedIn Profile</Label>
                            <Input
                              id="linkedIn"
                              name="linkedIn"
                              value={formData.linkedIn}
                              onChange={handleInputChange}
                              type="url"
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="https://linkedin.com/in/yourprofile"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="portfolio" className="text-sm font-medium text-gray-700">Portfolio URL</Label>
                            <Input
                              id="portfolio"
                              name="portfolio"
                              value={formData.portfolio}
                              onChange={handleInputChange}
                              type="url"
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                              placeholder="https://yourportfolio.com"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100">
                            <FileText className="h-5 w-5 text-orange-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Cover Letter</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-700">
                            Why are you interested in this position?
                          </Label>
                          <Textarea
                            id="coverLetter"
                            name="coverLetter"
                            value={formData.coverLetter}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                            placeholder="Tell us why you're a great fit for this role, your relevant experience, and what excites you about this opportunity..."
                          />
                          <p className="text-xs text-gray-500">Share your motivation and relevant experience</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-100">
                            <UploadCloud className="h-5 w-5 text-indigo-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Resume Upload</h3>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="resume" className="text-sm font-medium text-gray-700">Upload Resume</Label>
                          <Input
                            id="resume"
                            name="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {resumeName && (
                            <div className="flex items-center gap-2 text-green-700 text-sm">
                              <CheckCircle className="h-4 w-4" />
                              {resumeName}
                            </div>
                          )}
                          {!resumeName && currentResume?.fileName && (
                            <div className="flex items-center gap-2 text-blue-700 text-sm">
                              <Info className="h-4 w-4" />
                              Using saved resume: <button type="button" onClick={() => currentResume?.url && window.open(currentResume.url, '_blank')} className="underline">{currentResume.fileName}</button>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                          <p className="text-xs text-red-600">Resume is required to apply.</p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          type="button"
                          onClick={() => setShowAIMatching(true)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
                        >
                          <Brain className="h-5 w-5 mr-2" />
                          Analyze Resume Match
                        </Button>
                      </div>

                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg"
                        >
                          <CheckSquare className="h-5 w-5 mr-2" />
                          Submit Application
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showAIMatching && userData && job && (() => {
        const uid = (userData as { _id?: string; id?: string })._id || (userData as { _id?: string; id?: string }).id || '';
        const jid = (job.id || job._id || job.jobId || '') as string;
        return (
          <AIResumeMatching
            isOpen={showAIMatching}
            onClose={() => setShowAIMatching(false)}
            userId={uid}
            jobId={jid}
            jobTitle={job.title}
            companyName={job.company}
          />
        );
      })()}
    </div>
  );
};

export default JobApplication;