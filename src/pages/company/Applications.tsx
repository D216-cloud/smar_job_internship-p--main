import { useState, useEffect } from 'react';
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
  Plus,
  Eye,
  Edit,
  Trash2,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  applications?: number;
}

export const Applications = () => {
  const navigate = useNavigate();
  const { userData } = useAuthContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (userData?._id) {
      fetchJobs();
    }
  }, [userData?._id]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/jobs/company/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      closed: "destructive",
      draft: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`/api/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchJobs(); // Refresh the list
      } catch (error) {
        // Handle error
      }
    }
  };

  const stats = [
    {
      title: "Jobs Uploaded",
      value: jobs.length,
      icon: Briefcase,
      color: "text-blue-600",
      description: "Total jobs uploaded by your company"
    },
    {
      title: "Active Jobs",
      value: jobs.filter(job => job.status === 'active').length,
      icon: TrendingUp,
      color: "text-green-600",
      description: "Currently active"
    },
    {
      title: "Total Applications",
      value: jobs.reduce((total, job) => total + (job.applications || 0), 0),
      icon: Users,
      color: "text-purple-600",
      description: "From candidates"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Job Applications
            </h1>
            <p className="text-gray-600 text-lg">
              Manage all your posted jobs and view applications
            </p>
            {userData?.name && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <span className="text-base font-medium text-blue-800">
                    {userData.name} has posted <span className="font-bold text-blue-900">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchJobs} variant="outline" className="w-full md:w-auto">
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate('/company/post-job')} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    placeholder="Search jobs by title or location..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Posted Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading jobs...</p>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-sm text-gray-600">Debug Info:</p>
                  <p className="text-xs text-gray-500">User ID: {userData?._id || 'Not available'}</p>
                  <p className="text-xs text-gray-500">Token: {localStorage.getItem('token') ? 'Available' : 'Not available'}</p>
                  <p className="text-xs text-gray-500">Jobs loaded: {jobs.length}</p>
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">
                  {jobs.length === 0
                    ? "You haven't posted any jobs yet."
                    : "No jobs match your search criteria."}
                </p>
                {jobs.length === 0 && (
                  <Button onClick={() => navigate('/company/post-job')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                )}
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
                      <TableHead>Applications</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => {
                      // Count applications for this job
                      const applicationsForJob = Array.isArray((window as any).companyApplications)
                        ? (window as any).companyApplications.filter((app: any) => app.jobId?._id === job._id)
                        : [];
                      const applicationCount = applicationsForJob.length;
                      return (
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
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span>{job.salary ? `₹${job.salary}` : 'Not specified'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(job.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span>{applicationCount}</span>
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
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/company/jobs/${job._id}`)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                                title="Edit Job"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteJob(job._id)}
                                title="Delete Job"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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