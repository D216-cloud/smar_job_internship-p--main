import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Eye, 
  Edit, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Building2, 
  MapPin, 
  DollarSign, 
  UserCheck, 
  Trash2, 
  Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/context/AuthContext';
import { LucideIcon } from 'lucide-react';
import axios from 'axios';

// Type definitions
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
  trend?: boolean;
  trendValue?: string | number;
}

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
  };
  userId: string;
  status: string;
  appliedAt: string;
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
  status?: string; // Make status optional since API might not always provide it
  createdAt: string;
  type?: string;
  applications?: number;
}

// Extend window interface for global data
declare global {
  interface Window {
    companyApplications?: Application[];
  }
}

// Modern StatCard component with animation
const StatCard = ({ icon: Icon, label, value, gradient, trend, trendValue }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  >
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
              whileHover={{ rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && trendValue !== undefined && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-sm font-medium ${
                      typeof trendValue === 'number' 
                        ? (trendValue > 0 ? 'text-green-600' : 'text-red-600')
                        : 'text-gray-600'
                    }`}
                  >
                    {typeof trendValue === 'number' ? `${trendValue > 0 ? '+' : ''}${trendValue}%` : trendValue}
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { userData } = useAuthContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingJob, setUploadingJob] = useState(false);

  const handleJobUpload = async (formData: FormData) => {
    try {
      setUploadingJob(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/jobs/create', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchJobs();
    } catch (error) {
      console.error('Error uploading job:', error);
    } finally {
      setUploadingJob(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await axios.get('/api/jobs/company/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setJobs(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?._id) {
      fetchJobs();
    }
  }, [userData?._id]);

  const filteredJobs = jobs;

  const totalJobsPosted = jobs.length;
  const activeJobs = jobs.filter(job => (job.status || 'pending') === 'active').length;
  const totalApplicationsReceived = jobs.reduce((total, job) => total + (job.applications || 0), 0);
  const candidatesHired = 0; // Static for now as applications section was removed

  const stats = [
    {
      title: 'Jobs Posted',
      value: totalJobsPosted,
      icon: Briefcase,
      gradient: 'from-blue-600 to-indigo-600',
      trend: true,
      trendValue: totalJobsPosted,
    },
    {
      title: 'Active Jobs',
      value: activeJobs,
      icon: TrendingUp,
      gradient: 'from-green-600 to-teal-600',
      trend: true,
      trendValue: Math.round((activeJobs / (totalJobsPosted || 1)) * 100),
    },
    {
      title: 'Applications',
      value: totalApplicationsReceived,
      icon: Users,
      gradient: 'from-purple-600 to-pink-600',
      trend: true,
      trendValue: totalApplicationsReceived,
    },
    {
      title: 'Success Rate',
      value: candidatesHired,
      icon: UserCheck,
      gradient: 'from-emerald-600 to-cyan-600',
      trend: true,
      trendValue: totalApplicationsReceived > 0 ? Math.round((candidatesHired / totalApplicationsReceived) * 100) : 0,
    },
  ];

  const getStatusBadge = (status: string | undefined) => {
    // Handle undefined or null status with fallback
    const safeStatus = status || 'pending';
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      closed: 'destructive',
      draft: 'outline',
      pending: 'outline',
      interviewed: 'secondary',
      accepted: 'default',
      rejected: 'destructive',
      hired: 'default',
    };
    return (
      <Badge
        variant={variants[safeStatus] || 'outline'}
        className="px-3 py-1 rounded-full text-xs font-medium bg-opacity-80"
      >
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
      </Badge>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-700">
              Company Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-2 font-medium">
              Streamline your hiring with real-time job posting insights
            </p>
            {userData?.name && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6 p-5 bg-white/95 rounded-2xl border border-blue-100 shadow-md backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <span className="text-base font-semibold text-gray-900">
                    {userData.name} has posted{' '}
                    <span className="font-bold text-blue-800">{totalJobsPosted}</span> job
                    {totalJobsPosted !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-bold text-gray-900">{activeJobs}</span> Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-700">
                      <span className="font-bold text-gray-900">{totalApplicationsReceived}</span>{' '}
                      Applications
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Button
                variant="outline"
                onClick={() => fetchJobs()}
                className="h-11 rounded-xl bg-white/90 hover:bg-gray-100 border-gray-200 shadow-sm"
              >
                <TrendingUp className="h-5 w-5 mr-2 text-gray-700" />
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Button
                onClick={() => navigate('/company/post-job')}
                className="h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post New Job
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              icon={stat.icon}
              label={stat.title}
              value={stat.value}
              gradient={stat.gradient}
              trend={stat.trend}
              trendValue={stat.trendValue}
            />
          ))}
        </div>

        {/* Enhanced Posted Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Your Job Postings
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Monitor and manage your active job listings
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/company/post-job')}
                  className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
                </Button>
              </motion.div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <AnimatePresence>
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative text-center py-12 bg-gray-50/90 rounded-xl backdrop-blur-sm"
                  >
                    {/* Particle Effects */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(12)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
                          initial={{
                            x: Math.random() * 100 - 50,
                            y: Math.random() * 100 - 50,
                            scale: 0.4,
                          }}
                          animate={{
                            y: [0, -40, 0],
                            opacity: [0.2, 0.7, 0.2],
                            scale: [0.4, 1.2, 0.4],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                          }}
                          style={{ left: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="w-12 h-12 text-blue-600" />
                      </motion.div>
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                        className="text-lg font-semibold text-gray-700"
                      >
                        Fetching Job Listings...
                      </motion.span>
                      <motion.div
                        className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden"
                        initial={{ width: 0 }}
                        animate={{ width: '16rem' }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600" />
                      </motion.div>
                    </div>
                  </motion.div>
                ) : filteredJobs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No Jobs Found
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      You haven't posted any jobs yet. Start by creating a new job posting.
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Button
                        onClick={() => navigate('/company/post-job')}
                        className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200">
                        <TableHead className="text-gray-900 font-semibold">Job Details</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Location & Salary</TableHead>
                        <TableHead className="hidden md:table-cell text-gray-900 font-semibold">Posted Date</TableHead>
                        <TableHead className="hidden lg:table-cell text-gray-900 font-semibold">Job Type</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Applications</TableHead>
                        <TableHead className="text-gray-900 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job, index) => {
                        const applicationsForJob = Array.isArray(window.companyApplications)
                          ? window.companyApplications.filter(
                              (app: Application) => app.jobId?._id === job._id
                            )
                          : [];
                        const applicationCount = applicationsForJob.length;
                        return (
                          <motion.tr
                            key={job._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="hover:bg-gray-50/50 transition-colors border-b border-gray-100"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-center text-white text-sm font-medium shadow-md"
                                  whileHover={{ scale: 1.1 }}
                                  transition={{ type: 'spring', stiffness: 300 }}
                                >
                                  {job.title.charAt(0).toUpperCase()}
                                </motion.div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{job.title}</div>
                                  <div className="text-sm text-gray-600 truncate max-w-xs">
                                    {job.description}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <Building2 className="h-3 w-3" />
                                    <span>{job.company || 'Company'}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-500" />
                                  <span>{job.location || 'Remote'}</span>
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-gray-500" />
                                  <span>{job.salary ? `₹${job.salary}` : 'Not specified'}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(job.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900">Type:</span>
                                  <span className="text-gray-600 ml-1">
                                    {job.postingType || job.type || 'Full-time'}
                                  </span>
                                </div>
                                {job.company && (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-900">Company:</span>
                                    <span className="text-gray-600 ml-1">{job.company}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {getStatusBadge(job.status)}
                                <div className="text-xs text-gray-500">
                                  {job.status === 'active' && 'Accepting applications'}
                                  {job.status === 'inactive' && 'Not accepting applications'}
                                  {job.status === 'closed' && 'Position filled'}
                                  {job.status === 'draft' && 'Draft - not published'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-gray-900">{applicationCount}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {applicationCount === 0 && 'No applications yet'}
                                  {applicationCount === 1 && '1 application'}
                                  {applicationCount > 1 && `${applicationCount} applications`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/company/jobs/${job._id}/applications`)}
                                    title="View Applications"
                                    className="h-8 rounded-lg border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                  >
                                    <Users className="h-4 w-4 text-blue-600" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/company/jobs/${job._id}`)}
                                    title="View Job Details"
                                    className="h-8 rounded-lg border-green-200 hover:bg-green-50 hover:border-green-300"
                                  >
                                    <Eye className="h-4 w-4 text-green-600" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                                    title="Edit Job"
                                    className="h-8 rounded-lg border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300"
                                  >
                                    <Edit className="h-4 w-4 text-yellow-600" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteJob(job._id)}
                                    title="Delete Job"
                                    className="h-8 rounded-lg border-red-200 hover:bg-red-50 hover:border-red-300"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </motion.div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 rounded-xl border-gray-200 bg-white/90 hover:bg-gray-100 shadow-sm"
                    onClick={() => navigate('/company/post-job')}
                  >
                    <Plus className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Post New Job</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 rounded-xl border-gray-200 bg-white/90 hover:bg-gray-100 shadow-sm"
                    onClick={() => navigate('/company/candidates')}
                  >
                    <Users className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Browse Candidates</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 rounded-xl border-gray-200 bg-white/90 hover:bg-gray-100 shadow-sm"
                    onClick={() => navigate('/company/analytics')}
                  >
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">View Analytics</span>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};