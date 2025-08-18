import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Users,
  UserCheck,
  Clock,
  FileText,
  Briefcase,
  TrendingUp,
  BarChart3,
  UserPlus,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  MoreVertical,
  Star,
  Check,
  X,
  Clock4,
  ListChecks,
  Send,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface Application {
  _id: string;
  id?: string;
  candidateName: string;
  email: string;
  jobTitle: string;
  jobId: string;
  status: string;
  appliedAt: string;
  companyId?: string;
  phone?: string;
  experience?: string;
  skills?: string;
  coverLetter?: string;
  currentPosition?: string;
  currentCompany?: string;
  expectedSalary?: string;
  resume?: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  company: string;
  companyId: string;
  postingType: string;
  status: string;
  createdAt: string;
  applications?: number;
}

export const Candidates = () => {
  const navigate = useNavigate();
  const { userData } = useAuthContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      console.log('Fetching complete application data...');
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);

      const [applicationsResponse, jobsResponse] = await Promise.all([
        axios.get('/api/applications/check-all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get('/api/jobs/company/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      ]);

      console.log('Complete applications response:', applicationsResponse.data);
      const allApplications = applicationsResponse.data.applications || [];

      const transformedApplications = allApplications.map((app: Application) => ({
  _id: app._id || app.id,
        candidateName: app.candidateName,
        email: app.email,
        jobTitle: app.jobTitle,
        jobId: app.jobId,
        status: app.status,
        appliedAt: app.appliedAt,
        companyId: app.companyId,
        phone: app.phone || '',
        experience: app.experience || '',
        skills: app.skills || '',
        coverLetter: app.coverLetter || '',
        currentPosition: app.currentPosition || '',
        currentCompany: app.currentCompany || '',
        expectedSalary: app.expectedSalary || '',
        resume: app.resume || ''
      }));

      console.log('Transformed applications:', transformedApplications);
      setApplications(transformedApplications);
      setJobs(jobsResponse.data || []);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: "Error",
        description: "Failed to fetch candidate data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.skills?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.jobId === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  const getCandidateCountForJob = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  const jobsWithCandidateCounts = jobs.map(job => ({
    ...job,
    candidateCount: getCandidateCountForJob(job._id)
  }));

  const getStatusBadge = (status: string) => {
    const statusColors = {
      applied: "bg-blue-100 text-blue-800",
      reviewing: "bg-purple-100 text-purple-800",
      interview: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      selected: "bg-emerald-100 text-emerald-800",
      hired: "bg-teal-100 text-teal-800",
      rejected: "bg-red-100 text-red-800"
    };

    const statusLabels = {
      applied: "Applied",
      reviewing: "Reviewing",
      interview: "Interview",
      shortlisted: "Shortlisted",
      selected: "Selected",
      hired: "Hired",
      rejected: "Rejected"
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'} text-xs px-2 py-1 rounded-full`}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    if (!applicationId || applicationId === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid application ID. Cannot update status.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await axios.put(`/api/applications/${applicationId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      let message = '';
      let toastType: 'success' | 'info' | 'warning' = 'success';
      switch (newStatus) {
        case 'interview':
          message = 'Interview scheduled!';
          break;
        case 'selected':
        case 'hired':
          message = 'Candidate selected!';
          break;
        case 'rejected':
          message = 'Candidate rejected.';
          toastType = 'warning';
          break;
        case 'shortlisted':
          message = 'Candidate shortlisted!';
          toastType = 'info';
          break;
        default:
          message = 'Status updated!';
      }
      toast[toastType](message, {
        description: `Status changed to: ${newStatus}`,
        duration: 3000,
      });
      fetchData();
    } catch (error: unknown) {
      // Type guard for axios error
      type AxiosErrorData = { response?: { data?: { status?: string; application?: { status?: string } } } };
      const err = error as AxiosErrorData;
      if (err?.response?.data?.status === newStatus || err?.response?.data?.application?.status === newStatus) {
        toast({
          title: "Status updated!",
          description: `Status changed to: ${newStatus}`,
          duration: 3000,
        });
        fetchData();
      } else {
        console.error('Error updating status:', error, err?.response);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const stats = [
    {
      title: "Total Candidates",
      value: applications.length,
      icon: Users,
      color: "text-blue-500",
      change: "+12% from last month"
    },
    {
      title: "In Review",
      value: applications.filter(app => ['applied', 'reviewing'].includes(app.status)).length,
      icon: FileText,
      color: "text-purple-500",
      change: "+5% from last month"
    },
    {
      title: "Interviewing",
      value: applications.filter(app => app.status === 'interview').length,
      icon: Clock4,
      color: "text-yellow-500",
      change: "3 scheduled today"
    },
    {
      title: "Hired",
      value: applications.filter(app => ['selected', 'hired'].includes(app.status)).length,
      icon: UserCheck,
      color: "text-green-500",
      change: "2 this week"
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'applied', label: 'Applied' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'interview', label: 'Interview' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'selected', label: 'Selected' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const toggleApplicationExpand = (id: string) => {
    setExpandedApplication(expandedApplication === id ? null : id);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleExport = () => {
    toast({
      title: "Export initiated",
      description: "Your candidate data will be prepared for download.",
    });
    // Actual export implementation would go here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Candidate Pipeline</h1>
            <p className="text-gray-600 mt-2">
              Manage all candidates applying to your open positions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchData}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => navigate('/company/post-job')} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color.replace('text', 'bg')}/10`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Job Pipeline Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Job Pipeline Overview</CardTitle>
                <CardDescription>
                  View candidate distribution across your open positions
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View all jobs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobsWithCandidateCounts.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs posted yet</h3>
                <p className="mt-1 text-gray-500">
                  Post your first job to start receiving applications from candidates.
                </p>
                <div className="mt-6">
                  <Button onClick={() => navigate('/company/post-job')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post a Job
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {jobsWithCandidateCounts.slice(0, 3).map((job) => (
                  <div key={job._id} className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {job.location} • {job.salary ? `₹${job.salary}` : 'Salary not specified'}
                        </p>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline">{job.status}</Badge>
                          <span className="text-sm text-gray-500">
                            Posted {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{job.candidateCount}</div>
                      <p className="text-sm text-gray-500">Candidates</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-blue-600 mt-2"
                        onClick={() => navigate(`/company/jobs/${job._id}/applications`)}
                      >
                        View applicants
                      </Button>
                    </div>
                  </div>
                ))}
                {jobsWithCandidateCounts.length > 3 && (
                  <div className="text-center">
                    <Button variant="ghost" className="text-blue-600">
                      View all {jobs.length} jobs
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidates Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Candidates</CardTitle>
                <CardDescription>
                  {filteredApplications.length} of {applications.length} candidates
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by job" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Skeleton key={i} className="h-[72px] w-full" />
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {applications.length === 0 ? 'No candidates yet' : 'No matching candidates'}
                </h3>
                <p className="mt-1 text-gray-500">
                  {applications.length === 0 
                    ? 'Post a job to start receiving applications from candidates.'
                    : 'Try adjusting your search or filter criteria.'}
                </p>
                {applications.length === 0 && (
                  <div className="mt-6">
                    <Button onClick={() => navigate('/company/post-job')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Post a Job
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredApplications.map((app) => (
                  <div key={app._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div 
                      className={`p-4 cursor-pointer transition-colors ${expandedApplication === app._id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleApplicationExpand(app._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarFallback>{getInitials(app.candidateName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{app.candidateName}</h4>
                            <p className="text-sm text-gray-500">{app.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="hidden md:block">
                            <div className="text-sm font-medium">{app.jobTitle}</div>
                            <div className="text-xs text-gray-500">
                              Applied {new Date(app.appliedAt).toLocaleDateString()}
                            </div>
                          </div>
                          {getStatusBadge(app.status)}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {expandedApplication === app._id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedApplication === app._id && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Candidate Details */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-900">Candidate Details</h5>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{app.phone || 'Not provided'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Briefcase className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  {app.currentPosition || 'Not specified'}
                                  {app.currentCompany && ` at ${app.currentCompany}`}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  Expected Salary: {app.expectedSalary || 'Not specified'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Job & Application */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-900">Application Details</h5>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <Briefcase className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{app.jobTitle}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  Applied on {new Date(app.appliedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                {app.resume ? (
                                  <a 
                                    href={`/uploads/${app.resume}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    View Resume
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-500">No resume</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-900">Quick Actions</h5>
                            <div className="flex flex-wrap gap-2">
                              <Select 
                                value={app.status} 
                                onValueChange={(value) => handleStatusUpdate(app._id, value)}
                              >
                                <SelectTrigger className="w-full">
                                  <span className="truncate">Change Status</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="applied">Applied</SelectItem>
                                  <SelectItem value="reviewing">Reviewing</SelectItem>
                                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                                  <SelectItem value="interview">Interview</SelectItem>
                                  <SelectItem value="selected">Selected</SelectItem>
                                  <SelectItem value="hired">Hired</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <div className="flex gap-2 w-full">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleStatusUpdate(app._id, 'shortlisted')}
                                        disabled={app.status === 'shortlisted'}
                                      >
                                        <Star className="h-4 w-4 mr-2" />
                                        Shortlist
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Mark as shortlisted</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleStatusUpdate(app._id, 'interview')}
                                        disabled={app.status === 'interview'}
                                      >
                                        <Clock4 className="h-4 w-4 mr-2" />
                                        Interview
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Schedule interview</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              
                              <div className="flex gap-2 w-full">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleStatusUpdate(app._id, 'selected')}
                                  disabled={['selected', 'hired'].includes(app.status)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                  disabled={app.status === 'rejected'}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Skills and Cover Letter */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Skills & Experience</h5>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm">
                                <span className="font-medium">Experience:</span> {app.experience || 'Not specified'}
                              </p>
                              <p className="text-sm mt-2">
                                <span className="font-medium">Skills:</span> {app.skills || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Cover Letter</h5>
                            <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                              <p className="text-sm">
                                {app.coverLetter || 'No cover letter provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};