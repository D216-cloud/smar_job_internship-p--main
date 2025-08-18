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
  TableRow,
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
  TrendingUp,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [refreshing, setRefreshing] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

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
      setRefreshing(true);
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
    } finally {
      setRefreshing(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { style: "bg-emerald-100 text-emerald-800", label: "Active" },
      inactive: { style: "bg-amber-100 text-amber-800", label: "Inactive" },
      closed: { style: "bg-rose-100 text-rose-800", label: "Closed" },
      draft: { style: "bg-gray-100 text-gray-800", label: "Draft" }
    };
    
    const statusConfig = variants[status as keyof typeof variants] || { style: "bg-gray-100 text-gray-800", label: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.style}`}>
        {statusConfig.label}
      </span>
    );
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`/api/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const stats = [
    {
      title: "Total Jobs",
      value: jobs.length,
      icon: Briefcase,
      trend: jobs.length > 0 ? "positive" : "neutral",
      description: "All jobs posted",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Jobs",
      value: jobs.filter(job => job.status === 'active').length,
      icon: TrendingUp,
      trend: jobs.filter(job => job.status === 'active').length > 0 ? "positive" : "neutral",
      description: "Currently accepting applications",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Total Applications",
      value: jobs.reduce((total, job) => total + (job.applications || 0), 0),
      icon: Users,
      trend: jobs.reduce((total, job) => total + (job.applications || 0), 0) > 0 ? "positive" : "neutral",
      description: "Candidate applications received",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ];

  const toggleJobExpand = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Job Dashboard
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Manage your job postings, track applications, and find the perfect candidates
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button 
              onClick={fetchJobs} 
              variant="outline" 
              className="gap-2"
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Data
            </Button>
            <Button 
              onClick={() => navigate('/company/post-job')} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Search jobs by title, location, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base shadow-sm"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-12">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-lg font-semibold text-gray-800">Your Job Postings</CardTitle>
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{filteredJobs.length}</span> of{' '}
                <span className="font-medium text-gray-700">{jobs.length}</span> jobs
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="py-8 px-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border-b">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                  <Briefcase className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {jobs.length === 0 ? "Ready to post your first job?" : "No matching jobs found"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {jobs.length === 0
                    ? "Start attracting qualified candidates by creating your first job posting."
                    : "Try adjusting your search or filter criteria to find what you're looking for."}
                </p>
                {jobs.length === 0 ? (
                  <Button 
                    onClick={() => navigate('/company/post-job')} 
                    className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Job
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="min-w-[200px]">Job Details</TableHead>
                    <TableHead className="min-w-[120px]">Location</TableHead>
                    <TableHead className="min-w-[120px]">Salary</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Applications</TableHead>
                    <TableHead className="min-w-[120px]">Posted Date</TableHead>
                    <TableHead className="min-w-[150px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <>
                      <TableRow 
                        key={job._id} 
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleJobExpand(job._id)}
                      >
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                          >
                            {expandedJob === job._id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.company}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{job.location || 'Remote'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>{job.salary ? `₹${job.salary}` : 'Not specified'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{job.applications || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(job.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/company/jobs/${job._id}/applications`);
                              }}
                              className="text-blue-600 border-blue-100 hover:bg-blue-50 h-8 w-8 p-0"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/company/jobs/${job._id}/edit`);
                              }}
                              className="text-green-600 border-green-100 hover:bg-green-50 h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJob(job._id);
                              }}
                              className="text-red-600 border-red-100 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedJob === job._id && (
                        <TableRow className="bg-blue-50">
                          <TableCell colSpan={8}>
                            <div className="p-4 pl-16">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-2">
                                  <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                                  <div className="space-y-2">
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start gap-2"
                                      onClick={() => navigate(`/company/jobs/${job._id}/applications`)}
                                    >
                                      <Users className="h-4 w-4" />
                                      View Applications
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start gap-2"
                                      onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit Job Details
                                    </Button>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start gap-2"
                                      onClick={() => window.open(`/jobs/${job._id}`, '_blank')}
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Public Listing
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};