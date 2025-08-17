import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import axios from 'axios';

interface Application {
  _id: string;
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

  useEffect(() => {
    // Fetch data immediately when component mounts
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching complete application data...');
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);

      // Fetch all applications with complete user and job data
      const applicationsResponse = await axios.get('/api/applications/check-all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Complete applications response:', applicationsResponse.data);
      const allApplications = applicationsResponse.data.applications || [];

      // Transform the data to match our interface
      const transformedApplications = allApplications.map((app: Application) => ({
        _id: app._id,
        candidateName: app.candidateName,
        email: app.email,
        jobTitle: app.jobTitle,
        jobId: app.jobId,
        status: app.status,
        appliedAt: app.appliedAt,
        companyId: app.companyId,
        // Add additional fields that might be available
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

      // Try to fetch jobs
      let jobsResponse;
      try {
        jobsResponse = await axios.get('/api/jobs/company/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Jobs response:', jobsResponse.data);
        setJobs(jobsResponse.data);
      } catch (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        setJobs([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in fetchData:', error);
      setLoading(false);
    }
  };

  const fetchDataWithUserId = async (userId: string) => {
    try {
      console.log('Fetching data for company:', userId);
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);

      // Fetch both applications and jobs
      const [applicationsResponse, jobsResponse] = await Promise.all([
        axios.get(`/api/applications/company-jobs/${userId}`, {
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

      console.log('Applications response:', applicationsResponse.data);
      console.log('Jobs response:', jobsResponse.data);
      console.log('Number of applications found:', applicationsResponse.data.length);
      console.log('Number of jobs found:', jobsResponse.data.length);

      // Log each application to see the structure
      applicationsResponse.data.forEach((app, index) => {
        console.log(`Application ${index + 1}:`, {
          id: app._id,
          candidateName: app.fullName,
          email: app.email,
          jobTitle: app.jobId?.title,
          jobId: app.jobId?._id,
          status: app.status,
          appliedAt: app.appliedAt
        });
      });

      // Log each job to see the structure
      jobsResponse.data.forEach((job, index) => {
        console.log(`Job ${index + 1}:`, {
          id: job._id,
          title: job.title,
          company: job.company,
          status: job.status
        });
      });

      setApplications(applicationsResponse.data);
      setJobs(jobsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data with userId:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
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

  // Calculate candidate counts per job
  const getCandidateCountForJob = (jobId: string) => {
    const count = applications.filter(app => app.jobId === jobId).length;
    console.log(`Candidate count for job ${jobId}:`, count);
    return count;
  };

  // Get jobs with candidate counts
  const jobsWithCandidateCounts = jobs.map(job => {
    const candidateCount = getCandidateCountForJob(job._id);
    console.log(`Job "${job.title}" (${job._id}) has ${candidateCount} candidates`);
    return {
      ...job,
      candidateCount
    };
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      applied: "outline",
      reviewing: "secondary",
      interview: "default",
      shortlisted: "default",
      selected: "default",
      hired: "default",
      rejected: "destructive",
      active: "default",
      inactive: "secondary",
      closed: "destructive",
      draft: "outline"
    };
    
    const statusLabels: Record<string, string> = {
      applied: "Applied",
      reviewing: "Under Review",
      interview: "Interview Scheduled",
      shortlisted: "Shortlisted",
      selected: "Selected",
      hired: "Hired",
      rejected: "Rejected"
    };
    
    return (
      <div className="flex flex-col gap-1">
        <Badge variant={variants[status] || "outline"} className="text-xs">
          {statusLabels[status] || status}
        </Badge>
        <div className="text-xs text-gray-500">
          {status === 'applied' && 'Awaiting review'}
          {status === 'reviewing' && 'Application being reviewed'}
          {status === 'interview' && 'Interview scheduled'}
          {status === 'shortlisted' && 'Candidate shortlisted'}
          {status === 'selected' && 'Candidate selected'}
          {status === 'hired' && 'Successfully hired'}
          {status === 'rejected' && 'Application rejected'}
        </div>
      </div>
    );
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      console.log(`Updating application ${applicationId} status to: ${newStatus}`);
      
      const response = await axios.put(`/api/applications/${applicationId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      console.log('Status update response:', response.data);
      
      // Show success message based on status
      let message = '';
      let toastType: 'success' | 'info' | 'warning' = 'success';
      
      switch (newStatus) {
        case 'interview':
          message = 'Candidate scheduled for interview! They will be notified.';
          toastType = 'success';
          break;
        case 'selected':
        case 'hired':
          message = 'Candidate selected! They will be notified of the good news.';
          toastType = 'success';
          break;
        case 'rejected':
          message = 'Candidate rejected. They will be notified respectfully.';
          toastType = 'warning';
          break;
        case 'shortlisted':
          message = 'Candidate shortlisted! They will be notified.';
          toastType = 'info';
          break;
        default:
          message = 'Status updated successfully!';
          toastType = 'success';
      }
      
      toast[toastType](message, {
        description: `Status changed to: ${newStatus}`,
        duration: 3000,
      });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const apiError = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
      toast({
        title: "Error",
        description: `Error updating status: ${apiError || errorMessage}`,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleAcceptCandidate = async (applicationId: string) => {
    await handleStatusUpdate(applicationId, 'selected');
  };

  const handleRejectCandidate = async (applicationId: string) => {
    await handleStatusUpdate(applicationId, 'rejected');
  };

  const handleScheduleInterview = async (applicationId: string) => {
    await handleStatusUpdate(applicationId, 'interview');
  };

  const handleShortlistCandidate = async (applicationId: string) => {
    await handleStatusUpdate(applicationId, 'shortlisted');
  };

  const testAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/applications/test-auth', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Auth test response:', response.data);
      alert(`Auth test successful!\nUser ID: ${response.data.userId}\nUser: ${JSON.stringify(response.data.user, null, 2)}`);
    } catch (error) {
      console.error('Auth test failed:', error);
      alert(`Auth test failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const testAllApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/applications/test-all-applications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('All applications test response:', response.data);
      alert(`All Applications Test:\nTotal: ${response.data.count}\nApplications: ${JSON.stringify(response.data.applications, null, 2)}`);
    } catch (error) {
      console.error('All applications test failed:', error);
      alert(`All applications test failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token available. Please log in again.');
        return;
      }

      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Refreshed user data:', response.data);
      alert(`User data refreshed!\nUser ID: ${response.data._id}\nEmail: ${response.data.email}\nRole: ${response.data.role}`);
      
      // Force a re-fetch of data
      if (response.data._id) {
        await fetchDataWithUserId(response.data._id);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      alert(`Failed to refresh user data: ${error.response?.data?.error || error.message}`);
    }
  };

  const forceRefresh = async () => {
    try {
      console.log('Force refreshing all data...');
      setLoading(true);
      
      // Clear any cached data
      setApplications([]);
      setJobs([]);
      
      // Try to get user ID from token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const userIdFromToken = decoded.userId || decoded._id;
          
          if (userIdFromToken) {
            console.log('Force refresh using user ID from token:', userIdFromToken);
            await fetchDataWithUserId(userIdFromToken);
            return;
          }
        } catch (tokenError) {
          console.error('Error decoding token in force refresh:', tokenError);
        }
      }
      
      // If no token or user ID, try to refresh user data first
      await refreshUserData();
    } catch (error) {
      console.error('Force refresh failed:', error);
      setLoading(false);
    }
  };

  const testCurrentAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token available');
        return;
      }

      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('Current token decoded:', decoded);
      
      alert(`Current Auth State:\nToken User ID: ${decoded.userId || decoded._id}\nContext User ID: ${userData?._id || 'Not available'}\nIs Authenticated: ${userData ? 'Yes' : 'No'}\nToken Expires: ${new Date(decoded.exp * 1000).toLocaleString()}`);
    } catch (error) {
      console.error('Error testing current auth:', error);
      alert(`Error testing auth: ${error.message}`);
    }
  };

  const stats = [
    {
      title: "Total Candidates",
      value: applications.length,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Interviews Scheduled",
      value: applications.filter(app => app.status === 'interview').length,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Shortlisted",
      value: applications.filter(app => app.status === 'shortlisted').length,
      icon: UserCheck,
      color: "text-purple-600"
    },
    {
      title: "Selected/Hired",
      value: applications.filter(app => app.status === 'hired' || app.status === 'selected').length,
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Pending Review",
      value: applications.filter(app => app.status === 'applied' || app.status === 'reviewing').length,
      icon: FileText,
      color: "text-yellow-600"
    }
  ];

  // Get unique jobs for filter
  const uniqueJobs = Array.from(new Set(applications.map(app => app.jobId))).map(jobId => {
    const app = applications.find(a => a.jobId === jobId);
    return {
      id: jobId,
      title: app?.jobTitle || 'Unknown Job'
    };
  });

  const createTestApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token available');
        return;
      }

      // Get the first job
      if (jobs.length === 0) {
        alert('No jobs available. Please post a job first.');
        return;
      }

      const firstJob = jobs[0];
      console.log('Creating test application for job:', firstJob._id);

      const testApplication = {
        jobId: firstJob._id,
        companyId: userData?._id,
        companyName: userData?.firstName || 'Test Company',
        fullName: 'Test Candidate',
        email: 'test@example.com',
        phone: '1234567890',
        experience: '5 years',
        skills: 'JavaScript, React, Node.js',
        coverLetter: 'This is a test application for debugging purposes.',
        status: 'applied'
      };

      const response = await axios.post('/api/applications/apply', testApplication, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Test application created:', response.data);
      alert('Test application created successfully!');
      
      // Refresh the data
      await fetchData();
    } catch (error) {
      console.error('Error creating test application:', error);
      alert(`Error creating test application: ${error.response?.data?.error || error.message}`);
    }
  };

  const createTestData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token available. Please log in again.');
        return;
      }

      console.log('Creating test data...');

      // First, create a test job
      const testJob = {
        title: 'Test Software Developer',
        description: 'We are looking for a skilled software developer to join our team.',
        location: 'Remote',
        salary: '50000',
        company: userData?.firstName || 'Test Company',
        requirements: 'JavaScript, React, Node.js',
        type: 'Full-time',
        status: 'active'
      };

      console.log('Creating test job:', testJob);

      const jobResponse = await axios.post('/api/jobs/post', testJob, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Test job created:', jobResponse.data);

      // Wait a moment for the job to be saved
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now create a test application
      const testApplication = {
        jobId: jobResponse.data._id,
        companyId: userData?._id,
        companyName: userData?.firstName || 'Test Company',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        experience: '3 years',
        skills: 'JavaScript, React, Node.js, MongoDB',
        coverLetter: 'I am excited to apply for this position. I have experience in full-stack development and am passionate about creating user-friendly applications.',
        status: 'applied'
      };

      console.log('Creating test application:', testApplication);

      const appResponse = await axios.post('/api/applications/apply', testApplication, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Test application created:', appResponse.data);
      alert('Test data created successfully!\n- Test job created\n- Test application created\n\nPlease refresh the page to see the data.');

      // Refresh the data
      await fetchData();
    } catch (error) {
      console.error('Error creating test data:', error);
      alert(`Error creating test data: ${error.response?.data?.error || error.message}`);
    }
  };

  const checkDataState = () => {
    const state = {
      userData: userData,
      userDataId: userData?._id,
      token: localStorage.getItem('token') ? 'Available' : 'Not available',
      jobsCount: jobs.length,
      applicationsCount: applications.length,
      jobs: jobs.map(job => ({ id: job._id, title: job.title })),
      applications: applications.map(app => ({ 
        id: app._id, 
        candidateName: app.candidateName, 
        jobTitle: app.jobTitle,
        status: app.status 
      }))
    };

    console.log('Current data state:', state);
    alert(`Data State:\n\nUser ID: ${state.userDataId || 'Not available'}\nToken: ${state.token}\nJobs: ${state.jobsCount}\nApplications: ${state.applicationsCount}\n\nJobs: ${state.jobs.map(j => j.title).join(', ') || 'None'}\n\nApplications: ${state.applications.map(a => `${a.candidateName} (${a.jobTitle})`).join(', ') || 'None'}`);
  };

  const createSimpleTest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token available. Please log in again.');
        return;
      }

      console.log('Creating simple test application...');

      // First, check if we have any jobs
      const jobsResponse = await axios.get('/api/jobs/company/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Available jobs:', jobsResponse.data);

      if (jobsResponse.data.length === 0) {
        // Create a test job first
        const testJob = {
          title: 'Test Job for Applications',
          description: 'A test job to verify applications work',
          location: 'Remote',
          salary: '50000',
          company: userData?.firstName || 'Test Company',
          requirements: 'Basic skills',
          type: 'Full-time',
          status: 'active'
        };

        const jobResponse = await axios.post('/api/jobs/post', testJob, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Test job created:', jobResponse.data);

        // Create application for this job
        const testApplication = {
          jobId: jobResponse.data._id,
          companyId: userData?._id,
          companyName: userData?.firstName || 'Test Company',
          fullName: 'Test Candidate',
          email: 'test@example.com',
          phone: '1234567890',
          experience: '2 years',
          skills: 'JavaScript, React',
          coverLetter: 'I am a test candidate applying for this position.',
          status: 'applied'
        };

        const appResponse = await axios.post('/api/applications/apply', testApplication, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Test application created:', appResponse.data);
        alert('Test data created successfully!\nJob: Test Job for Applications\nApplication: Test Candidate\n\nPlease refresh the page.');
      } else {
        // Use the first available job
        const firstJob = jobsResponse.data[0];
        console.log('Using existing job:', firstJob);

        const testApplication = {
          jobId: firstJob._id,
          companyId: userData?._id,
          companyName: userData?.firstName || 'Test Company',
          fullName: 'Test Candidate',
          email: 'test@example.com',
          phone: '1234567890',
          experience: '2 years',
          skills: 'JavaScript, React',
          coverLetter: 'I am a test candidate applying for this position.',
          status: 'applied'
        };

        const appResponse = await axios.post('/api/applications/apply', testApplication, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Test application created:', appResponse.data);
        alert('Test application created successfully!\nCandidate: Test Candidate\nJob: ' + firstJob.title + '\n\nPlease refresh the page.');
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error creating simple test:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const checkAllApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token available. Please log in again.');
        return;
      }

      console.log('Checking all applications in database...');

      const response = await axios.get('/api/applications/check-all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('All applications response:', response.data);

      const { totalCount, applications } = response.data;

      if (totalCount === 0) {
        alert('No applications found in the database.\n\nThis means:\n1. No candidates have applied yet\n2. Or there are no jobs posted\n3. Or the applications are not linked to your company\n\nTry creating a test application first.');
      } else {
        const applicationsList = applications.map((app: Application, index: number) => 
          `${index + 1}. ${app.candidateName} (${app.email})\n   Job: ${app.jobTitle}\n   Status: ${app.status}\n   Applied: ${new Date(app.appliedAt).toLocaleDateString()}`
        ).join('\n\n');

        alert(`Found ${totalCount} applications in database:\n\n${applicationsList}`);
      }
    } catch (error) {
      console.error('Error checking all applications:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const createCompleteTestApplication = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token available. Please log in again.');
        return;
      }

      console.log('Creating complete test application...');

      // First, check if we have any jobs
      const jobsResponse = await axios.get('/api/jobs/company/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Available jobs:', jobsResponse.data);

      if (jobsResponse.data.length === 0) {
        // Create a test job first
        const testJob = {
          title: 'Senior Software Developer',
          description: 'We are looking for an experienced software developer to join our team.',
          location: 'Remote',
          salary: '80000',
          company: userData?.firstName || 'Test Company',
          requirements: 'JavaScript, React, Node.js, MongoDB, 5+ years experience',
          type: 'Full-time',
          status: 'active'
        };

        const jobResponse = await axios.post('/api/jobs/post', testJob, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Test job created:', jobResponse.data);

        // Create application for this job with complete data
        const testApplication = {
          jobId: jobResponse.data._id,
          companyId: userData?._id,
          companyName: userData?.firstName || 'Test Company',
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '555-123-4567',
          experience: '5 years',
          skills: 'JavaScript, React, Node.js, MongoDB, TypeScript, AWS',
          coverLetter: 'I am an experienced software developer with 5 years of experience in full-stack development. I have worked on various projects using modern technologies and am passionate about creating scalable applications.',
          currentPosition: 'Senior Developer',
          currentCompany: 'Tech Solutions Inc.',
          expectedSalary: '$85,000',
          status: 'applied'
        };

        const appResponse = await axios.post('/api/applications/apply', testApplication, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Complete test application created:', appResponse.data);
        alert('Complete test application created successfully!\n\nCandidate: Sarah Johnson\nJob: Senior Software Developer\n\nPlease refresh the page to see the data.');
      } else {
        // Use the first available job
        const firstJob = jobsResponse.data[0];
        console.log('Using existing job:', firstJob);

        const testApplication = {
          jobId: firstJob._id,
          companyId: userData?._id,
          companyName: userData?.firstName || 'Test Company',
          fullName: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '555-123-4567',
          experience: '5 years',
          skills: 'JavaScript, React, Node.js, MongoDB, TypeScript, AWS',
          coverLetter: 'I am an experienced software developer with 5 years of experience in full-stack development. I have worked on various projects using modern technologies and am passionate about creating scalable applications.',
          currentPosition: 'Senior Developer',
          currentCompany: 'Tech Solutions Inc.',
          expectedSalary: '$85,000',
          status: 'applied'
        };

        const appResponse = await axios.post('/api/applications/apply', testApplication, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Complete test application created:', appResponse.data);
        alert('Complete test application created successfully!\n\nCandidate: Sarah Johnson\nJob: ' + firstJob.title + '\n\nPlease refresh the page to see the data.');
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error creating complete test application:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const quickTest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No token! Please log in again.');
        return;
      }

      console.log('Quick test - checking data...');

      // Test 1: Check all applications
      const allAppsResponse = await axios.get('/api/applications/check-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('All apps:', allAppsResponse.data);

      // Test 2: Check company jobs
      const jobsResponse = await axios.get('/api/jobs/company/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Company jobs:', jobsResponse.data);

      if (allAppsResponse.data.totalCount === 0) {
        // Create test data immediately
        alert('No applications found. Creating test data now...');
        
        // Create a job first
        const testJob = {
          title: 'Test Developer Job',
          description: 'Test job for applications',
          location: 'Remote',
          salary: '50000',
          company: 'Test Company',
          requirements: 'Basic skills',
          type: 'Full-time',
          status: 'active'
        };

        const jobRes = await axios.post('/api/jobs/post', testJob, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Create application
        const testApp = {
          jobId: jobRes.data._id,
          companyId: userData?._id || 'test-company',
          companyName: 'Test Company',
          fullName: 'Test Candidate',
          email: 'test@example.com',
          phone: '1234567890',
          experience: '2 years',
          skills: 'JavaScript, React',
          coverLetter: 'I want this job',
          currentPosition: 'Developer',
          currentCompany: 'Test Corp',
          expectedSalary: '50000',
          status: 'applied'
        };

        const appRes = await axios.post('/api/applications/apply', testApp, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert('Test data created! Refreshing...');
        window.location.reload();
      } else {
        alert(`Found ${allAppsResponse.data.totalCount} applications and ${jobsResponse.data.length} jobs. Data should be visible now.`);
      }
    } catch (error) {
      console.error('Quick test error:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Candidates
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage all candidates who applied to your jobs
          </p>
          {userData?.name && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-base font-medium text-green-800">
                  {userData.name} has received <span className="font-bold text-green-900">{applications.length}</span> candidate{applications.length !== 1 ? 's' : ''} application{applications.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => fetchData()} 
            className="bg-white/80"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={quickTest} 
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Quick Test & Fix
          </Button>
          <Button 
            onClick={() => navigate('/company/post-job')} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.title === "Total Candidates" && "All applications"}
                {stat.title === "Interviews Scheduled" && "In interview process"}
                {stat.title === "Candidates Hired" && "Successfully placed"}
                {stat.title === "Pending Review" && "Awaiting review"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Overview Section - Shows candidate counts per job */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Job Overview - Candidate Applications
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how many candidates have applied to each of your posted jobs
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading job statistics...</p>
            </div>
          ) : jobsWithCandidateCounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-4">
                You haven't posted any jobs yet. Post your first job to start receiving applications.
              </p>
              <Button onClick={() => navigate('/company/post-job')}>
                <Briefcase className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Candidates Applied</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsWithCandidateCounts.map((job) => (
                    <TableRow key={job._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{job.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{job.location || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span>{job.salary ? `₹${job.salary}` : 'Not specified'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            job.candidateCount > 10 ? 'bg-green-500' :
                            job.candidateCount > 5 ? 'bg-yellow-500' :
                            job.candidateCount > 0 ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            {job.candidateCount}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{job.candidateCount} candidate{job.candidateCount !== 1 ? 's' : ''}</div>
                            <div className="text-xs text-muted-foreground">
                              {job.candidateCount === 0 ? 'No applications yet' :
                               job.candidateCount === 1 ? '1 application' :
                               `${job.candidateCount} applications`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/company/jobs/${job._id}/applications`)}
                            title="View Applications"
                            disabled={job.candidateCount === 0}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/company/jobs/${job._id}`)}
                            title="View Job Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                            title="Edit Job"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search candidates by name, email, skills, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="reviewing">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview Scheduled</option>
              <option value="selected">Selected</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Jobs</option>
              {uniqueJobs.map((job) => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <p className="text-sm text-muted-foreground">
            Showing {filteredApplications.length} of {applications.length} candidates
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading candidates...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No candidates found</h3>
              <p className="text-gray-600 mb-4">
                {applications.length === 0 
                  ? "No candidates have applied to your jobs yet." 
                  : "No candidates match your search criteria."}
              </p>
              {applications.length === 0 && (
                <div className="space-y-2">
                  <Button onClick={() => navigate('/company/post-job')}>
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                  <Button 
                    onClick={createTestData} 
                    variant="outline"
                    className="ml-2"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Create Test Data
                  </Button>
                  <Button 
                    onClick={createSimpleTest} 
                    variant="outline"
                    className="ml-2"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Quick Test Application
                  </Button>
                  <Button 
                    onClick={createCompleteTestApplication} 
                    variant="outline"
                    className="ml-2"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Complete Test Application
                  </Button>
                </div>
              )}

              {/* Sample Candidate Card */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-2">Sample Candidate Information (What you'll see when candidates apply):</p>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">John Doe</h4>
                    <Badge variant="outline">Applied</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><Mail className="h-3 w-3 inline mr-1" />john.doe@example.com</p>
                    <p><Phone className="h-3 w-3 inline mr-1" />123-456-7890</p>
                    <p><Briefcase className="h-3 w-3 inline mr-1" />Software Developer at Tech Corp</p>
                    <p><TrendingUp className="h-3 w-3 inline mr-1" />Expected Salary: $60,000</p>
                    <p><FileText className="h-3 w-3 inline mr-1" />Skills: JavaScript, React, Node.js</p>
                    <p><Calendar className="h-3 w-3 inline mr-1" />Applied: Today</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Candidate Information</TableHead>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Experience & Skills</TableHead>
                    <TableHead>Current Position</TableHead>
                    <TableHead>Expected Salary</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app._id}>
                      <TableCell>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-lg">{app.candidateName}</h4>
                            {getStatusBadge(app.status)}
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-500" />
                              <span>{app.email}</span>
                            </div>
                            {app.phone && app.phone !== 'Not provided' && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-500" />
                                <span>{app.phone}</span>
                              </div>
                            )}
                            {app.currentPosition && app.currentPosition !== 'Not specified' && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-purple-500" />
                                <span>{app.currentPosition}</span>
                                {app.currentCompany && app.currentCompany !== 'Not specified' && (
                                  <span className="text-gray-500">at {app.currentCompany}</span>
                                )}
                              </div>
                            )}
                            {app.expectedSalary && app.expectedSalary !== 'Not specified' && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-orange-500" />
                                <span>Expected Salary: {app.expectedSalary}</span>
                              </div>
                            )}
                            {app.skills && app.skills !== 'Not specified' && (
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                <span>Skills: {app.skills}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>Applied: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{app.jobTitle}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{app.jobId}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium mb-1">Experience: {app.experience || 'Not specified'}</div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Skills:</span> {app.skills || 'Not specified'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {app.currentPosition ? (
                            <>
                              <div className="text-sm font-medium">{app.currentPosition}</div>
                              <div className="text-xs text-muted-foreground">at {app.currentCompany}</div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">Not specified</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {app.expectedSalary || 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {app.resume ? (
                          <a href={`/uploads/${app.resume}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Resume</a>
                        ) : (
                          <span className="text-gray-400">No Resume</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(app.status)}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                            className="text-xs px-2 py-1 border rounded bg-background"
                          >
                            <option value="applied">Applied</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="interview">Interview</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="selected">Selected</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {/* Status Update Dropdown */}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                            className="text-xs px-2 py-1 border rounded bg-background hover:bg-gray-50"
                          >
                            <option value="applied">Applied</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="selected">Selected</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          
                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleScheduleInterview(app._id)}
                              title="Schedule Interview"
                              className="text-xs px-2 py-1 h-6 bg-blue-50 hover:bg-blue-100 border-blue-200"
                              disabled={app.status === 'interview'}
                            >
                              Interview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShortlistCandidate(app._id)}
                              title="Shortlist Candidate"
                              className="text-xs px-2 py-1 h-6 bg-purple-50 hover:bg-purple-100 border-purple-200"
                              disabled={app.status === 'shortlisted'}
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAcceptCandidate(app._id)}
                              title="Accept Candidate"
                              className="text-xs px-2 py-1 h-6 bg-green-50 hover:bg-green-100 border-green-200"
                              disabled={app.status === 'selected' || app.status === 'hired'}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectCandidate(app._id)}
                              title="Reject Candidate"
                              className="text-xs px-2 py-1 h-6 bg-red-50 hover:bg-red-100 border-red-200"
                              disabled={app.status === 'rejected'}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
                 </CardContent>
       </Card>
       </div>
     </div>
   );
 };