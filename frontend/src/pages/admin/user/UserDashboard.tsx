import { Link, useNavigate } from "react-router-dom";
import { JobCard } from "@/components/user/JobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
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
  // CheckCircle,
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
  // Target,
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
  Banknote
} from "lucide-react";
import { useAvailableJobs } from "@/hooks/useAvailableJobs";
import { useAuthContext } from '@/context/AuthContext';
import { useEffect, useState } from "react";
import { LucideIcon } from 'lucide-react';

// Type definitions
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

interface ProfileTip {
  text: string;
  done: boolean;
}

// interface ProfileCompletionProps {
//   percent: number;
//   tips: ProfileTip[];
// }

// Enhanced StatCard component with modern styling
const StatCard = ({ icon: Icon, label, value, color, bgColor }: StatCardProps) => (
  <Card className="border-none bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
    <CardContent className="p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${bgColor} ${color} shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500 tracking-tight">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced ApplicationRow component with modern styling
const ApplicationRow = ({ app, job, status }: ApplicationRowProps) => (
  <TableRow className="hover:bg-gray-50/80 transition-colors duration-200 border-b border-gray-100">
    <TableCell>
      <div className="flex items-center gap-3">
        {job?.logo && (
          <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm" />
        )}
        <div>
          <span className="font-semibold text-gray-800 text-sm">{job?.title || 'Job Title'}</span>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{job?.location || 'Remote'}</span>
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <span className="font-medium text-gray-700 text-sm">{job?.company || 'Company'}</span>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Calendar className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-600">{new Date(app.appliedAt).toLocaleDateString()}</span>
      </div>
    </TableCell>
    <TableCell>
      <Badge
        variant={status === 'accepted' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary'}
        className="rounded-full px-3 py-1 text-xs font-medium"
      >
        {status === 'accepted' ? 'Accepted' : status === 'rejected' ? 'Rejected' : 'Submitted'}
      </Badge>
    </TableCell>
  </TableRow>
);

// Enhanced ProfileCompletion component with modern styling
// const ProfileCompletion = ({ percent, tips }: ProfileCompletionProps) => (
//   <Card className="border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-2xl overflow-hidden">
//     <CardHeader className="pb-4">
//       <div className="flex items-center gap-3">
//         <div className="p-2 rounded-lg bg-blue-100/80 shadow-sm">
//           <Target className="h-5 w-5 text-blue-600" />
//         </div>
//         <CardTitle className="text-lg font-semibold text-gray-800">Profile Completion</CardTitle>
//       </div>
//     </CardHeader>
//     <CardContent className="space-y-5">
//       <div>
//         <div className="flex justify-between text-sm mb-2">
//           <span className="font-medium text-gray-700">Profile Progress</span>
//           <span className="font-bold text-blue-600">{percent}%</span>
//         </div>
//         <Progress value={percent} className="h-2 bg-blue-100 rounded-full" />
//       </div>
//       <div className="space-y-2">
//         {tips.map((tip: ProfileTip, i: number) => (
//           <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${tip.done ? 'bg-green-50/80 border border-green-100' : 'bg-gray-50/80 border border-gray-100'}`}>
//             {tip.done ? (
//               <CheckCircle className="h-4 w-4 text-green-600" />
//             ) : (
//               <Clock className="h-4 w-4 text-gray-400" />
//             )}
//             <span className={`text-xs ${tip.done ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
//               {tip.text}
//             </span>
//           </div>
//         ))}
//       </div>
//       <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg text-sm py-2 shadow-md">
//         Complete Profile
//       </Button>
//     </CardContent>
//   </Card>
// );

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
  // const [profileCompletion, setProfileCompletion] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [savedInternshipsCount, setSavedInternshipsCount] = useState(0);

  // Application status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => (app.status || 'applied').toLowerCase() === statusFilter);
  const recentApplications = [...filteredApplications].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).slice(0, 5);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      console.log('Fetching applications for user in dashboard:', userId);
      // Fetch applications
      fetch(`/api/applications/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          console.log('Dashboard applications data:', data);
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

  // Fetch saved jobs and internships count from localStorage
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

  // Removed profile completion calculation and UI

  // Helper to get job details from populated jobId
  const getJobDetails = (app: Application) => {
    if (!app.jobId || typeof app.jobId === 'string') return {};
    return {
      title: app.jobId.title,
      company: app.jobId.company,
      logo: app.jobId.logo,
    };
  };

  // Personalized greeting
  const userName = user?.firstName
    ? user.firstName
    : user?.email
      ? user.email.split('@')[0]
      : 'there';
  const userEmail = user?.email || '';

  // Profile completion tips based on user data
  // Removed profile tips

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 w-64 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-28 bg-gray-100 rounded-2xl"></Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-red-600 text-sm">Error loading dashboard: {error}</p>
            </div>
          </div>
          <Card className="border-none shadow-lg rounded-2xl">
            <CardContent className="text-center py-10">
              <p className="text-gray-600 mb-4">Unable to load available opportunities.</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 transition-all duration-300">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-16 h-16 border-2 border-gray-200 rounded-full shadow-sm">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xl font-semibold bg-blue-100 text-blue-700">
                  {userName[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {userName}
                </h1>
                <p className="text-gray-600 text-base">Discover your next career opportunity today!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700" asChild>
                <Link to="/user/profile">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="outline" className="rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700" asChild>
                <Link to="/user/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Briefcase} label="Available Jobs" value={totalJobs} color="text-blue-600" bgColor="bg-blue-100/80" />
          <StatCard icon={BookOpen} label="Internships" value={totalInternships} color="text-green-600" bgColor="bg-green-100/80" />
          <StatCard icon={FileText} label="Applications" value={applicationCount} color="text-purple-600" bgColor="bg-purple-100/80" />
          <StatCard icon={Heart} label="Saved" value={savedJobsCount + savedInternshipsCount} color="text-pink-600" bgColor="bg-pink-100/80" />
        </div>

        {/* Application Status Filter Section */}
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} className="rounded-lg text-sm">All</Button>
          <Button size="sm" variant={statusFilter === 'applied' ? 'default' : 'outline'} onClick={() => setStatusFilter('applied')} className="rounded-lg text-sm">Applied</Button>
          <Button size="sm" variant={statusFilter === 'interview' ? 'default' : 'outline'} onClick={() => setStatusFilter('interview')} className="rounded-lg text-sm">Interview</Button>
          <Button size="sm" variant={statusFilter === 'rejected' ? 'default' : 'outline'} onClick={() => setStatusFilter('rejected')} className="rounded-lg text-sm">Rejected</Button>
          <Button size="sm" variant={statusFilter === 'hired' ? 'default' : 'outline'} onClick={() => setStatusFilter('hired')} className="rounded-lg text-sm">Hired</Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Recent Applications Section */}
          <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-6 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100/80">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800">Recent Applications</CardTitle>
              </div>
              <Link to="/user/applications">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-6">
              {recentApplications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-gray-100/80 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-6 text-sm">Start your journey by applying to opportunities!</p>
                  <Link to="/user/jobs">
                    <Button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app, idx) => {
                    const job = getJobDetails(app);
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-100/80">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 text-sm">{job.title || 'Job Title'}</h4>
                            <p className="text-xs text-gray-600">{job.company || 'Company'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={app.status === 'hired' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                            {app.status || 'applied'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{new Date(app.appliedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Completion Section removed */}
        </div>

        {/* Featured Opportunities Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100/80">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Jobs</h2>
            </div>
            <Link to="/user/jobs">
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg text-sm">
                View All Jobs <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {jobs.length === 0 ? (
            <Card className="border-none bg-white shadow-lg rounded-2xl">
              <CardContent className="text-center py-12">
                <div className="p-4 rounded-full bg-gray-100/80 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs available</h3>
                <p className="text-gray-600 text-sm">Check back later for new opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.slice(0, 6).map((job) => (
                <Card key={job._id} className="border-none bg-white shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-blue-100/80 rounded-lg">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{job.title}</h3>
                        <p className="text-xs text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm py-2">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Featured Internships Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100/80">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Internships</h2>
            </div>
            <Link to="/user/internships">
              <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 rounded-lg text-sm">
                View All Internships <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {internships.length === 0 ? (
            <Card className="border-none bg-white shadow-lg rounded-2xl">
              <CardContent className="text-center py-12">
                <div className="p-4 rounded-full bg-gray-100/80 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No internships available</h3>
                <p className="text-gray-600 text-sm">Check back later for new opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.slice(0, 6).map((internship) => (
                <Card key={internship._id} className="border-none bg-white shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-green-100/80 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{internship.title}</h3>
                        <p className="text-xs text-gray-600">{internship.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{internship.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{internship.type || 'Full-time'}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm py-2">
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100/80">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800">Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/user/jobs">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 rounded-lg border-gray-200">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">Browse Jobs</span>
                </Button>
              </Link>
              <Link to="/user/internships">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-green-50 rounded-lg border-gray-200">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium">Internships</span>
                </Button>
              </Link>
              <Link to="/user/profile">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-purple-50 rounded-lg border-gray-200">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium">Profile</span>
                </Button>
              </Link>
              <Link to="/user/settings">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 rounded-lg border-gray-200">
                  <Settings className="h-6 w-6 text-orange-600" />
                  <span className="text-sm font-medium">Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};