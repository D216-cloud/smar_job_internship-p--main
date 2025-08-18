import { Link, useNavigate } from "react-router-dom";
import { JobCard } from "@/components/user/JobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  FileText,
  Clock,
  Briefcase,
  Users,
  TrendingUp,
  Eye,
  MapPin,
  Building,
  Settings,
  User as UserIcon,
  Upload,
  Zap,
  Star,
  BadgeCheck,
  DollarSign,
  Calendar,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  BookOpen,
  Heart,
  MessageSquare,
  Bell,
  Filter,
  Grid,
  List,
  Banknote,
} from "lucide-react";
import { useAvailableJobs } from "@/hooks/useAvailableJobs";
import { useAuthContext } from '@/context/AuthContext';
import { useEffect, useState } from "react";
import { LucideIcon } from 'lucide-react';

// Type definitions (unchanged)
interface Application {
  jobId: Job | string;
  fullName?: string;
  email?: string;
  phone?: string;
  coverLetter?: string;
  resumePath?: string;
  appliedAt: string;
  status?: string;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  logo?: string;
}

interface ApplicationRowProps {
  app: Application;
  job: Job;
  status: string;
}

// === UI-ENHANCED COMPONENTS BELOW ===

// ✅ StatCard: Modern, sleek with depth and icon glow
const StatCard = ({ icon: Icon, label, value, color, bgColor }: StatCardProps) => (
  <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden transform hover:-translate-y-1">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor} ${color} shadow-md transform transition-transform hover:scale-105`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 tracking-wide">{label}</p>
          <p className="text-3xl font-extrabold text-gray-800">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ✅ ApplicationRow: Sleek table row with better spacing and icons
const ApplicationRow = ({ app, job, status }: ApplicationRowProps) => (
  <TableRow className="hover:bg-blue-50/60 transition-colors duration-200 border-b border-gray-100 last:border-b-0">
    <TableCell className="py-5">
      <div className="flex items-center gap-4">
        {job?.logo ? (
          <img
            src={job.logo}
            alt={job.company}
            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border border-gray-200 shadow-sm">
            <Building className="h-5 w-5 text-white" />
          </div>
        )}
        <div>
          <span className="font-bold text-gray-800 text-sm">{job?.title || 'Job Title'}</span>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-gray-500 font-medium">{job?.location || 'Remote'}</span>
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <span className="font-semibold text-gray-700 text-sm">{job?.company || 'Company'}</span>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-xs text-gray-600 font-medium">
          {new Date(app.appliedAt).toLocaleDateString()}
        </span>
      </div>
    </TableCell>
    <TableCell>
      <Badge
        variant={
          status === 'accepted' ? 'default' :
          status === 'rejected' ? 'destructive' :
          status === 'interview' ? 'secondary' :
          'outline'
        }
        className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm"
      >
        {status === 'accepted' ? '✅ Accepted' : 
         status === 'rejected' ? '❌ Rejected' : 
         status === 'interview' ? '📅 Interview' : '📬 Applied'}
      </Badge>
    </TableCell>
  </TableRow>
);

export const UserDashboard = () => {
  const navigate = useNavigate();
  const {
    jobs,
    internships,
    loading,
    error,
    totalJobs,
    totalInternships,
    totalOpportunities,
  } = useAvailableJobs();
  const { userData: user } = useAuthContext();

  const [applications, setApplications] = useState<Application[]>([]);
  const [userJobs, setUserJobs] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [savedInternshipsCount, setSavedInternshipsCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => (app.status || 'applied').toLowerCase() === statusFilter);
  const recentApplications = [...filteredApplications].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).slice(0, 5);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      fetch(`/api/applications/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          const apps = Array.isArray(data) ? data : [];
          setApplications(apps);
          setApplicationCount(apps.length);
        })
        .catch(err => {
          console.error('Error fetching applications:', err);
          setApplications([]);
          setApplicationCount(0);
        });
    }
  }, [user?._id, user?.id]);

  useEffect(() => {
    if (user?._id) {
      fetch(`/api/jobs/user/${user._id}`)
        .then(res => res.json())
        .then(data => setUserJobs(data));
    }
  }, [user?._id]);

  useEffect(() => {
    const savedJobs = localStorage.getItem('savedJobs');
    const savedInternships = localStorage.getItem('savedInternships');

    if (savedJobs) {
      const savedJobsArray = JSON.parse(savedJobs);
      setSavedJobsCount(savedJobsArray.length);
    }

    if (savedInternships) {
      const savedInternshipsArray = JSON.parse(savedInternships);
      setSavedInternshipsCount(savedInternshipsArray.length);
    }
  }, []);

  const getJobDetails = (app: Application) => {
    if (!app.jobId || typeof app.jobId === 'string') return {};
    return {
      title: app.jobId.title,
      company: app.jobId.company,
      logo: app.jobId.logo,
    };
  };

  const userName = user?.firstName
    ? user.firstName
    : user?.email
      ? user.email.split('@')[0]
      : 'there';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-12 w-1/3 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 w-2/3 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl shadow"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-red-600 text-sm mt-1">Error: {error}</p>
          </div>
          <Card className="border-none shadow-xl rounded-2xl bg-white">
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Failed to load opportunities.</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="rounded-xl border-gray-200 hover:bg-gray-50 text-sm"
              >
                Reload
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* === Header === */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 p-8 transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-16 h-16 border-2 border-blue-100 shadow-lg rounded-full">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md">
                  {userName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  Hello, <span className="text-blue-600">{userName}</span> 👋
                </h1>
                <p className="text-gray-600 text-base mt-1">
                  Your next career move is just one application away.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 text-sm px-4">
                <Link to="/user/profile">
                  <UserIcon className="h-4 w-4 mr-2" /> Profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 text-sm px-4">
                <Link to="/user/settings">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* === Stats Grid === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Briefcase} label="Jobs Available" value={totalJobs} color="text-blue-600" bgColor="bg-blue-50" />
          <StatCard icon={BookOpen} label="Internships" value={totalInternships} color="text-green-600" bgColor="bg-green-50" />
          <StatCard icon={FileText} label="Applications" value={applicationCount} color="text-purple-600" bgColor="bg-purple-50" />
          <StatCard icon={Heart} label="Saved" value={savedJobsCount + savedInternshipsCount} color="text-pink-600" bgColor="bg-pink-50" />
        </div>

        {/* === Filter Buttons === */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {['all', 'applied', 'interview', 'rejected', 'hired'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all ${
                statusFilter === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* === Recent Applications === */}
        <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-6 px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 shadow-sm">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Recent Applications</CardTitle>
            </div>
            <Link to="/user/applications">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6 text-sm">Start your journey by applying to jobs or internships.</p>
                <Link to="/user/jobs">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4 mr-2" /> Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app, idx) => {
                  const job = getJobDetails(app);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-100 bg-white hover:bg-blue-50/60 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-100 shadow-sm">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{job.title || 'Job Title'}</h4>
                            <p className="text-xs text-gray-600">{job.company || 'Company'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              app.status === 'hired' ? 'default' :
                              app.status === 'rejected' ? 'destructive' :
                              app.status === 'interview' ? 'secondary' : 'outline'
                            }
                            className="text-xs font-bold px-3 py-1 rounded-full"
                          >
                            {app.status || 'Applied'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* === Featured Jobs === */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 shadow-sm">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
            </div>
            <Link to="/user/jobs">
              <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {jobs.length === 0 ? (
            <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
              <CardContent className="py-12 text-center">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">No jobs available</h3>
                <p className="text-gray-600 text-sm">Check back soon for new opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 6).map((job) => (
                <Card key={job._id} className="border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg shadow-sm">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{job.title}</h3>
                        <p className="text-xs text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-4 w-4 text-blue-500" /> {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-4 w-4 text-blue-500" /> {job.type}
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold shadow-md">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* === Featured Internships === */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-100 shadow-sm">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Internships</h2>
            </div>
            <Link to="/user/internships">
              <Button variant="outline" className="rounded-xl border-green-200 text-green-600 hover:bg-green-50 text-sm font-medium">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {internships.length === 0 ? (
            <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800">No internships yet</h3>
                <p className="text-gray-600 text-sm">New roles added weekly!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.slice(0, 6).map((internship) => (
                <Card key={internship._id} className="border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg shadow-sm">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{internship.title}</h3>
                        <p className="text-xs text-gray-600">{internship.company}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="h-4 w-4 text-green-500" /> {internship.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-4 w-4 text-green-500" /> {internship.type || 'Full-time'}
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-2.5 text-sm font-semibold shadow-md">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* === Quick Actions === */}
        <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 shadow-sm">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { to: "/user/jobs", icon: Briefcase, label: "Browse Jobs", color: "blue" },
                { to: "/user/internships", icon: BookOpen, label: "Internships", color: "green" },
                { to: "/user/profile", icon: UserIcon, label: "Profile", color: "purple" },
                { to: "/user/settings", icon: Settings, label: "Settings", color: "orange" },
              ].map((action, i) => (
                <Link key={i} to={action.to}>
                  <Button
                    variant="outline"
                    className={`w-full h-20 flex flex-col items-center justify-center gap-2 rounded-xl border-gray-200 hover:bg-${action.color}-50 hover:border-${action.color}-200 transition-all duration-200 text-sm font-semibold`}
                  >
                    <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};