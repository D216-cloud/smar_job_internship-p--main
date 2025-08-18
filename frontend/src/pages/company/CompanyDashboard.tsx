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
  Loader2,
  Sparkles
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
  status?: string;
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

// ✅ Modern StatCard with glassmorphism and hover effects
const StatCard = ({ icon: Icon, label, value, gradient, trend, trendValue }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
  >
    <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-md rounded-2xl transform hover:-translate-y-1">
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
  const candidatesHired = 0;

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
    const safeStatus = status || 'pending';
    
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      closed: 'destructive',
      draft: 'outline',
      pending: 'outline',
    };
    return (
      <Badge
        variant={variants[safeStatus] || 'outline'}
        className="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-700 tracking-tight">
              Company Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-2 font-medium">
              Streamline your hiring with real-time insights
            </p>
            
            {userData?.name && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6 p-6 bg-white/95 rounded-2xl border border-blue-100/60 shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <span className="text-base font-semibold text-gray-900">
                    {userData.name} has posted{' '}
                    <span className="font-bold text-blue-800">{totalJobsPosted}</span> job
                    {totalJobsPosted !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Button
                variant="outline"
                onClick={() => fetchJobs()}
                className="h-12 rounded-xl bg-white/90 hover:bg-gray-100 border-gray-200 shadow-sm text-sm font-medium px-5"
              >
                <TrendingUp className="h-5 w-5 mr-2 text-gray-700" />
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Button
                onClick={() => navigate('/company/post-job')}
                className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md px-6 font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post New Job
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
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

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-gray-900">Your Job Postings</CardTitle>
                <p className="text-sm text-gray-500 mt-1 font-medium">Manage and monitor your listings</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/company/post-job')}
                  className="h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm text-sm font-medium"
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
                    className="relative text-center py-16 bg-gray-50/80 rounded-xl backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {[...Array(10)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
                          initial={{ x: Math.random() * 100 - 50, y: Math.random() * 100 - 50, scale: 0.4 }}
                          animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2], scale: [0.4, 1.0, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                          style={{ left: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                      <span className="text-lg font-semibold text-gray-700">Loading job listings...</span>
                      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                ) : filteredJobs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Jobs Posted Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                      Start building your team by posting your first job.
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Button
                        onClick={() => navigate('/company/post-job')}
                        className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md px-6 font-medium"
                      >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Post Your First Job
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-100">
                        <TableHead className="font-semibold text-gray-800">Job Details</TableHead>
                        <TableHead className="font-semibold text-gray-800">Location & Salary</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-gray-800">Posted</TableHead>
                        <TableHead className="hidden lg:table-cell font-semibold text-gray-800">Type</TableHead>
                        <TableHead className="font-semibold text-gray-800">Status</TableHead>
                        <TableHead className="font-semibold text-gray-800">Applications</TableHead>
                        <TableHead className="font-semibold text-gray-800">Actions</TableHead>
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
                            className="hover:bg-blue-50/60 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <TableCell className="py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                                  {job.title.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-gray-800">{job.title}</div>
                                  <div className="text-sm text-gray-600 line-clamp-1">{job.description}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <Building2 className="h-3 w-3" />
                                    {job.company || 'Private'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                  {job.location || 'Remote'}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <DollarSign className="h-3.5 w-3.5 text-green-500" />
                                  ₹{job.salary || 'Not specified'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="text-sm text-gray-600">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge variant="outline" className="text-xs px-2.5 py-1">
                                {job.postingType || job.type || 'Full-time'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(job.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-sm">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-gray-800">{applicationCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/company/jobs/${job._id}/applications`)}
                                  title="View Applications"
                                  className="h-9 w-9 p-0 rounded-full hover:bg-blue-50"
                                >
                                  <Users className="h-4 w-4 text-blue-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/company/jobs/${job._id}`)}
                                  title="View Job"
                                  className="h-9 w-9 p-0 rounded-full hover:bg-green-50"
                                >
                                  <Eye className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                                  title="Edit Job"
                                  className="h-9 w-9 p-0 rounded-full hover:bg-yellow-50"
                                >
                                  <Edit className="h-4 w-4 text-yellow-600" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteJob(job._id)}
                                  title="Delete Job"
                                  className="h-9 w-9 p-0 rounded-full hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
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
          <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Post New Job", icon: Plus, to: "/company/post-job", color: "blue" },
                  { label: "Browse Candidates", icon: Users, to: "/company/candidates", color: "purple" },
                  { label: "View Analytics", icon: TrendingUp, to: "/company/analytics", color: "green" },
                ].map((action, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Button
                      variant="outline"
                      onClick={() => navigate(action.to)}
                      className={`h-20 w-full flex flex-col items-center justify-center gap-2 rounded-xl border-gray-200 bg-white/90 hover:bg-${action.color}-50 hover:border-${action.color}-200 shadow-sm transition-all`}
                    >
                      <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};