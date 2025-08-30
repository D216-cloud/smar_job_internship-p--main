import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  ArrowLeft,
  Eye,
  Edit,
  Users,
  Briefcase,
  MapPin,
  Calendar,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  UserCheck,
  Clock
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import axios from 'axios';

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
}

interface Application {
  _id: string;
  jobId: Job;
  userId: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  fullName?: string;
  email?: string;
  phone?: string;
  status: string;
  appliedAt?: string;
  createdAt: string;
  experience?: string;
  currentPosition?: string;
  resume?: string;
  coverLetter?: string;
}

export const JobApplications = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { userData } = useAuthContext();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (jobId) {
      fetchJobAndApplications();
    }
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch job details
      const jobResponse = await axios.get(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJob(jobResponse.data);

      // Fetch applications for this specific job
      const applicationsResponse = await axios.get(`/api/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(applicationsResponse.data);
    } catch (error) {
      console.error('Error fetching job and applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.fullName || `${app.userId?.firstName || ''} ${app.userId?.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || app.userId?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.currentPosition || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      applied: "outline",
      reviewing: "secondary",
      interviewed: "secondary",
      shortlisted: "default",
      hired: "default",
      rejected: "destructive",
      pending: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/applications/${applicationId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchJobAndApplications(); // Refresh the list
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const stats = [
    {
      title: "Total Applications",
      value: applications.length,
      icon: Users,
      color: "text-blue-600",
      description: "Candidates who applied"
    },
    {
      title: "Under Review",
      value: applications.filter(app => app.status === 'reviewing' || app.status === 'applied').length,
      icon: Clock,
      color: "text-yellow-600",
      description: "Applications being reviewed"
    },
    {
      title: "Shortlisted",
      value: applications.filter(app => app.status === 'shortlisted' || app.status === 'interviewed').length,
      icon: UserCheck,
      color: "text-green-600",
      description: "Candidates shortlisted"
    },
    {
      title: "Hired",
      value: applications.filter(app => app.status === 'hired').length,
      icon: TrendingUp,
      color: "text-emerald-600",
      description: "Successfully hired"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Job not found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/company/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/company/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Applications for {job.title}
            </h1>
            <p className="text-gray-600 text-lg">
              Review and manage applications for this position
            </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span className="text-base font-medium text-blue-800">
                  {job.title} • {job.location || 'Remote'}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-600">
                    <span className="font-bold text-gray-900">{applications.length}</span> Applications
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">{job.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="text-gray-600">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-gray-600">
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchJobAndApplications} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search candidates by name, email, or position..."
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
                <option value="interviewed">Interviewed</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Applications</CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredApplications.length} of {applications.length} applications
            </p>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">
                  No candidates have applied to this job yet. Share the job posting to attract candidates.
                </p>
                <Button onClick={() => navigate('/company/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No matching applications</h3>
                <p className="text-gray-600">
                  No applications match your search criteria. Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Current Position</TableHead>
                      <TableHead className="hidden lg:table-cell">Experience</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                {(app.fullName || app.userId?.firstName || 'U').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {app.fullName || `${app.userId?.firstName || ''} ${app.userId?.lastName || ''}`}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {app.currentPosition || 'Position not specified'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{app.email || app.userId?.email || 'No email'}</span>
                            </div>
                            {app.phone || app.userId?.phone ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{app.phone || app.userId?.phone}</span>
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {app.currentPosition || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {app.experience || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(app.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // View application details - could open a modal or navigate to detail page
                                console.log('View application:', app._id);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Quick status update dropdown or modal
                                const newStatus = prompt('Update status (applied/reviewing/shortlisted/interviewed/hired/rejected):', app.status);
                                if (newStatus && newStatus !== app.status) {
                                  handleStatusUpdate(app._id, newStatus);
                                }
                              }}
                              title="Update Status"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {app.resume && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(app.resume, '_blank')}
                                title="View Resume"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
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