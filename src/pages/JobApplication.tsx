import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
  Info,
  Save,
  Send,
  Eye,
  Heart,
  Share2,
  BookmarkPlus,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Download,
  ExternalLink,
  Shield,
  Zap,
  GraduationCap
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
    postedDate?: string;
    responsibilities?: string[];
    benefits?: string[];
  }

  interface SearchResultItem {
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
    postedDate?: string;
    responsibilities?: string[];
    benefits?: string[];
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
  const [isSaved, setIsSaved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [applicationMode, setApplicationMode] = useState<'quick' | 'detailed'>('detailed');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    education: '',
    availability: 'immediate',
    workType: 'full-time',
    relocate: false,
    referral: '',
    motivation: '',
    achievements: '',
    languagesSpoken: '',
    certifications: '',
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
        
        if (!id) {
          setError('No job ID provided');
          return;
        }
        
        if (!isValidObjectId(id)) {
          setError('Invalid job ID format');
          return;
        }

        // First try to get from search results cache
        const all = await searchResults('');
        const found = all.find((j: SearchResultItem) => j.id === id || (j._id && j._id === id)) as Job | undefined;

        if (found) {
          setJob(found);
          return;
        }

        // If not found in cache, try direct API calls for both jobs and internships
        try {
          // Try jobs first
          let response = await fetch(`/api/jobs/${id}`);
          if (response.ok) {
            const jobData = await response.json();
            setJob(jobData);
            return;
          }
          
          // If not found in jobs, try internships
          response = await fetch(`/api/internships/${id}`);
          if (response.ok) {
            const internshipData = await response.json();
            setJob(internshipData);
            return;
          }
          
          if (response.status === 404) {
            setError('Job or internship not found');
            return;
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (apiError) {
          console.warn('API call failed, checking for sample data:', apiError);
          
          // Fallback: Check local sample data first
          try {
            const { getAllJobs, getAllInternships } = await import('@/data/jobsData');
            const allJobs = getAllJobs();
            const allInternships = getAllInternships();
            
            const foundInSamples = [...allJobs, ...allInternships].find(item => 
              item.id === id || (item as unknown as Job)._id === id
            );
            
            if (foundInSamples) {
              // Transform benefits to ensure it's an array (split string if needed)
              const transformedJob: Job = {
                ...foundInSamples,
                _id: foundInSamples.id,
                benefits: typeof foundInSamples.benefits === 'string'
                  ? foundInSamples.benefits.split(', ')
                  : foundInSamples.benefits || []
              };
              setJob(transformedJob);
              return;
            }
          } catch (importError) {
            console.warn('Could not load sample data:', importError);
          }
          
          // Create a sample job for demonstration (useful for deployment without backend)
          if (process.env.NODE_ENV === 'production' || !import.meta.env.VITE_API_URL) {
            const isInternship = id.includes('int') || id.includes('intern');
            const sampleJob: Job = {
              _id: id,
              id: id,
              title: isInternship ? 'Sample Internship Position' : 'Sample Job Position',
              company: 'Demo Company',
              location: 'Remote',
              salary: isInternship ? '$2,000/month stipend' : '$50,000 - $70,000',
              type: isInternship ? 'Internship' : 'Full-time',
              postedBy: 'demo-company-id',
              postedDate: new Date().toISOString(),
              description: `This is a sample ${isInternship ? 'internship' : 'job'} posting for demonstration purposes. In a real deployment, this would be fetched from your backend API.`,
              requirements: 'Sample requirement 1, Sample requirement 2, Sample requirement 3',
              responsibilities: ['Sample responsibility 1', 'Sample responsibility 2'],
              benefits: ['Sample benefit 1', 'Sample benefit 2']
            };
            setJob(sampleJob);
            return;
          }
          
          throw apiError;
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        if (err instanceof Error) {
          if (err.message.includes('401')) {
            setError('Authentication required. Please log in again.');
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            localStorage.removeItem('userData');
            navigate('/login');
          } else if (err.message.includes('Network') || err.message.includes('fetch')) {
            setError('Unable to connect to server. Please check your internet connection.');
          } else {
            setError('Failed to load job details. Please try again.');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    // Early return if no ID
    if (!id) {
      setError('No job ID provided in URL');
      setLoading(false);
      return;
    }

    if (id && isAuthenticated) {
      fetchJob();
    } else if (id && !isAuthenticated && !authLoading) {
      setError('Please log in to view job applications');
      navigate('/login');
    } else if (!id) {
      setError('Invalid job URL');
      navigate('/user/jobs');
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
        setTimeout(() => setShowConfetti(false), 3000);
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
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 px-8 py-3"
              >
                Try Again
              </Button>
              <Link to="/jobs">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3">
                  Browse Jobs
                </Button>
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
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {[...Array(60)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl select-none animate-bounce-slow"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  fontSize: `${16 + Math.random() * 12}px`,
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                🎉
              </motion.div>
            ))}
          </div>
        )}

        <Card className="max-w-md mx-auto shadow-2xl z-20 backdrop-blur-xl bg-white/90 border border-white/20 animate-fade-in">
          <CardHeader className="text-center pb-8">
            <div className="relative inline-flex items-center justify-center p-4 mb-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg">
              <Sparkles className="h-10 w-10 text-white animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</CardTitle>
            <p className="text-lg text-gray-600">Congratulations, <span className="font-semibold text-gray-800">{formData.fullName}</span></p>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 backdrop-blur-sm">
              <p className="text-gray-700 mb-2"><strong>{job.title}</strong> at <strong>{job.company}</strong></p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-left bg-gray-50 rounded-xl p-5 border border-gray-100/50">
              <h4 className="font-semibold text-gray-800 mb-3">Your Application Summary:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Resume:</strong> {resumeName || currentResume?.fileName || 'Uploaded'}</li>
                <li><strong>Email:</strong> {formData.email}</li>
                <li><strong>Position:</strong> {formData.currentPosition || 'N/A'}</li>
                <li><strong>Experience:</strong> {formData.experience} years</li>
              </ul>
            </div>

            <Button 
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-2xl shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg"
            >
              <Link to="/user/applications">View My Applications</Link>
            </Button>

            <Button 
              variant="ghost"
              className="text-gray-500 hover:text-gray-700 text-sm font-medium border-t border-gray-200 pt-4"
              onClick={() => window.open(`mailto:${job.postedBy || 'careers@company.com'}?subject=Application%20for%20${encodeURIComponent(job.title)}&body=Dear%20Hiring%20Team,%0A%0AI%20have%20applied%20for%20the%20${job.title}%20role%20at%20${job.company}.%0A%0ABest%20regards,%0A${formData.fullName}`)}
            >
              <Mail className="h-4 w-4 mr-1" /> Contact Hiring Team
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Jobs</span>
            </Button>
          </div>
          
          {/* Premium AI Button */}
          <button
            onClick={() => setShowAIMatching(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            <Brain className="h-5 w-5 text-white" />
          </button>
        </div>

        
        {/* Job Details Section - Full width card */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                  {job.title}
                </CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
                  <p className="text-gray-600 flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {job.company}
                  </p>
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location || 'Remote'}
                  </p>
                  {job.salary && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </p>
                  )}
                </div>
                {job.type && (
                  <Badge 
                    variant="secondary" 
                    className="w-fit bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/50 font-medium mt-2"
                  >
                      {job.type}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-100/50">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Job Description</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {job.description || 'No description available.'}
                </p>
              </div>

              <Separator className="bg-gray-200/30" />

              <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-5 border border-gray-100/50">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Requirements</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {job.requirements || 'No requirements specified.'}
                </p>
              </div>

              <Separator className="bg-gray-200/30" />

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Posted today</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>237 applicants</span>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Application Form Panel */}
        <Card className="shadow-lg lg:shadow-2xl border-0 bg-white/95 lg:bg-white/90 backdrop-blur-xl hover:shadow-xl lg:hover:shadow-3xl transition-all duration-500 animate-fade-in rounded-lg lg:rounded-2xl">
            <CardHeader className="pb-4 lg:pb-8 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Apply Now
                  </CardTitle>
                  <p className="text-gray-600 text-sm lg:text-lg leading-relaxed">
                    Complete your application for <span className="font-bold text-gray-900">{job.title}</span> at <span className="font-bold text-gray-900">{job.company}</span>
                  </p>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-sm text-gray-500 mb-1">Progress</div>
                  <div className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formProgress}%
                  </div>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="mt-6 w-full h-2 lg:h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg transition-all duration-1000 ease-out"
                  style={{ width: `${formProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 opacity-30 animate-pulse"></div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 lg:space-y-8 p-4 lg:p-6">
              {!isLoggedIn ? (
                <div className="text-center py-12 lg:py-16">
                  <AlertCircle className="h-12 w-12 lg:h-16 lg:w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
                  <p className="text-gray-600 mb-6">You must be logged in to apply for this position.</p>
                  <Link to="/login">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 lg:px-10 py-3 lg:py-4 rounded-2xl font-semibold text-base lg:text-lg shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                      Login to Apply
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-8">
                  {/* Personal Info Section */}
                  <div className="space-y-4 lg:space-y-6 bg-gradient-to-r from-gray-50 to-blue-50 p-4 lg:p-8 rounded-xl lg:rounded-3xl border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                        <User className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg lg:text-2xl font-bold text-gray-900">Personal Information</h3>
                        <p className="text-sm lg:text-base text-gray-600">Let us know who you are</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="userId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          User ID
                          <span className="text-red-500">*</span>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200/50">
                            Auto-generated
                          </Badge>
                        </Label>
                        <div className="relative">
                          <Input
                            id="userId"
                            name="userId"
                            value={formData.userId}
                            onChange={handleInputChange}
                            required
                            className="h-12 lg:h-14 pl-10 lg:pl-12 pr-4 lg:pr-6 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                            placeholder="Auto-generated"
                            readOnly
                          />
                          <div className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={generateUserId}
                          className="h-10 lg:h-12 px-4 lg:px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium"
                        >
                          <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                          Regenerate ID
                        </Button>
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="you@example.com"
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4 lg:col-span-1">
                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Available Start Date</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="space-y-4 lg:space-y-6 bg-gradient-to-r from-gray-50 to-indigo-50 p-4 lg:p-8 rounded-xl lg:rounded-3xl border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                        <Briefcase className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg lg:text-2xl font-bold text-gray-900">Professional Experience</h3>
                        <p className="text-sm lg:text-base text-gray-600">Showcase your career journey</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="currentCompany" className="text-sm font-medium text-gray-700">Current Company</Label>
                        <Input
                          id="currentCompany"
                          name="currentCompany"
                          value={formData.currentCompany}
                          onChange={handleInputChange}
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="e.g., TechCorp Inc."
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="currentPosition" className="text-sm font-medium text-gray-700">Current Position</Label>
                        <Input
                          id="currentPosition"
                          name="currentPosition"
                          value={formData.currentPosition}
                          onChange={handleInputChange}
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="e.g., Senior Frontend Developer"
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="experience" className="text-sm font-medium text-gray-700">Years of Experience</Label>
                        <Input
                          id="experience"
                          name="experience"
                          type="number"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="e.g., 3"
                          min="0"
                          max="50"
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="expectedSalary" className="text-sm font-medium text-gray-700">Expected Salary (Annual)</Label>
                        <Input
                          id="expectedSalary"
                          name="expectedSalary"
                          type="number"
                          value={formData.expectedSalary}
                          onChange={handleInputChange}
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="$80,000"
                          min="0"
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4 lg:col-span-2">
                        <Label htmlFor="skills" className="text-sm font-medium text-gray-700">Key Skills & Technologies</Label>
                        <Input
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="React, TypeScript, Node.js, Tailwind CSS, Figma..."
                        />
                        <p className="text-xs text-gray-500">Separate with commas</p>
                      </div>
                    </div>
                  </div>

                  {/* Online Presence */}
                  <div className="space-y-4 lg:space-y-6 bg-gradient-to-r from-gray-50 to-purple-50 p-4 lg:p-8 rounded-xl lg:rounded-3xl border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg">
                        <Globe className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg lg:text-2xl font-bold text-gray-900">Online Presence</h3>
                        <p className="text-sm lg:text-base text-gray-600">Connect your professional profiles</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="linkedIn" className="text-sm font-medium text-gray-700">LinkedIn Profile</Label>
                        <Input
                          id="linkedIn"
                          name="linkedIn"
                          value={formData.linkedIn}
                          onChange={handleInputChange}
                          type="url"
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="https://linkedin.com/in/yourname"
                        />
                      </div>

                      <div className="space-y-3 lg:space-y-4">
                        <Label htmlFor="portfolio" className="text-sm font-medium text-gray-700">Portfolio / GitHub</Label>
                        <Input
                          id="portfolio"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleInputChange}
                          type="url"
                          className="h-12 lg:h-14 pl-4 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-6 bg-gradient-to-r from-gray-50 to-orange-50 p-8 rounded-3xl border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Cover Letter</h3>
                        <p className="text-gray-600">Tell us why you’re perfect for this role</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="coverLetter" className="text-sm font-medium text-gray-700">
                        Why are you interested in this position?
                      </Label>
                      <Textarea
                        id="coverLetter"
                        name="coverLetter"
                        value={formData.coverLetter}
                        onChange={handleInputChange}
                        required
                        rows={8}
                        className="w-full border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 shadow-sm p-6 rounded-xl resize-none"
                        placeholder="Dear Hiring Team,

I'm deeply inspired by [Company]'s mission to innovate in [industry]. With my 4+ years building scalable React applications and mentoring junior developers, I’m excited to bring my expertise in performance optimization and user-centric design to your team...

Sincerely,
[Your Name]"
                      />
                      <p className="text-xs text-gray-500">Be authentic. Tell your story. Don’t just list qualifications.</p>
                    </div>
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-6 bg-gradient-to-r from-gray-50 to-indigo-50 p-8 rounded-3xl border border-gray-100/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Resume Upload</h3>
                        <p className="text-gray-600">Your most important document</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="resume" className="text-sm font-medium text-gray-700">
                        Upload Your Resume (PDF/DOCX)
                      </Label>
                      <Input
                        id="resume"
                        name="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors duration-300 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                      >
                        <div className="text-center">
                          {resumeName ? (
                            <div className="flex items-center gap-3 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">{resumeName}</span>
                            </div>
                          ) : currentResume?.fileName ? (
                            <div className="flex items-center gap-3 text-blue-600">
                              <Info className="h-5 w-5" />
                              <span>Using saved: {currentResume.fileName}</span>
                              <button
                                type="button"
                                onClick={() => currentResume?.url && window.open(currentResume.url, '_blank')}
                                className="text-xs underline"
                              >
                                View
                              </button>
                            </div>
                          ) : (
                            <>
                              <UploadCloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <span className="text-gray-500">Drag & drop your resume here, or click to browse</span>
                              <p className="text-xs text-gray-400 mt-2">Max size: 5MB • PDF, DOC, DOCX</p>
                            </>
                          )}
                        </div>
                      </label>
                      <p className="text-xs text-red-600 font-medium">Resume is required to apply.</p>
                    </div>
                  </div>

                  {/* AI Match Button — Premium Feature */}
                  <div className="pt-4 lg:pt-6 text-center">
                    <Button
                      type="button"
                      onClick={() => setShowAIMatching(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 lg:py-5 rounded-2xl shadow-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-500 text-base lg:text-lg relative overflow-hidden group"
                      style={{
                        boxShadow:
                          '0 10px 25px rgba(16, 185, 129, 0.2), 0 0 30px rgba(16, 185, 129, 0.1)',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Brain className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-white" />
                      <span>✨ AI-Powered Resume Match Analysis</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                    </Button>
                  </div>

                  {/* Submit Button — Grand Finale */}
                  <div className="pt-4 lg:pt-6 text-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-5 lg:py-6 rounded-2xl shadow-3xl hover:from-blue-700 hover:to-purple-700 transition-all duration-500 text-lg lg:text-xl relative overflow-hidden group"
                      style={{
                        boxShadow:
                          '0 15px 35px rgba(59, 130, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 mr-3 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-5 w-5 lg:h-6 lg:w-6 mr-3" />
                          Submit My Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        
        {/* AI Resume Matching Modal — Ultra-Luxury Version */}
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
    </div>
  );
};

export default JobApplication;