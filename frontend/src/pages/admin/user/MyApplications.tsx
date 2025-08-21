import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Building,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  MessageSquare,
  Users,
  UserCheck,
  TrendingUp,
} from "lucide-react";

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
  };
  companyId?: {
    _id: string;
    name: string;
  };
  companyName: string;
  status: string;
  appliedAt: string;
  fullName?: string;
  email?: string;
  phone?: string;
  coverLetter?: string;
  resume?: string;
}

const MyApplications = () => {
  const { userData } = useAuthContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const userId = userData?._id || userData?.id;
    if (!userId) return;

    setLoading(true);
  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
      .then(data => {
        const apps = Array.isArray(data) ? data : [];
        setApplications(apps);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching applications:', err);
        setApplications([]);
        setLoading(false);
      });
  }, [userData]);

  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => app.status?.toLowerCase() === statusFilter.toLowerCase());

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selected':
      case 'hired':
      case 'accepted':
        return (
          <Badge className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 hover:from-green-200 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border border-green-200">
            ✅ Selected
          </Badge>
        );
      case 'rejected':
      case 'declined':
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-red-50 text-red-700 hover:from-red-200 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border border-red-200">
            ❌ Rejected
          </Badge>
        );
      case 'interview':
      case 'shortlisted':
        return (
          <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 hover:from-blue-200 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border border-blue-200">
            📅 Interview
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 hover:from-yellow-200 rounded-full px-3 py-1 text-xs font-semibold shadow-sm border border-yellow-200">
            🕒 Applied
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'interview': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="animate-pulse">
            <div className="h-10 w-1/3 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 w-2/3 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl shadow"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-2xl shadow"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* === Header === */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-3 rounded-2xl bg-blue-100/80 shadow-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600 text-base mt-1">Track your job journey in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-3xl font-extrabold text-blue-600">{applications.length}</div>
                <div className="text-sm text-gray-500 font-medium">Total Applications</div>
              </div>
            </div>
          </div>
        </div>

        {/* === Stats Overview === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Apps */}
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Total Applications</CardTitle>
              <div className="p-2 rounded-xl bg-blue-100 shadow-sm">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{applications.length}</div>
              <p className="text-sm text-gray-500 mt-1">All submissions</p>
            </CardContent>
          </Card>

          {/* Interviews */}
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Interviews</CardTitle>
              <div className="p-2 rounded-xl bg-green-100 shadow-sm">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {applications.filter(app => app.status === 'interview').length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Scheduled or upcoming</p>
            </CardContent>
          </Card>

          {/* Selected */}
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Selected</CardTitle>
              <div className="p-2 rounded-xl bg-purple-100 shadow-sm">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {applications.filter(app => app.status === 'selected').length}
              </div>
              <p className="text-sm text-gray-500 mt-1">Offers received</p>
            </CardContent>
          </Card>

          {/* Success Rate */}
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Success Rate</CardTitle>
              <div className="p-2 rounded-xl bg-orange-100 shadow-sm">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {applications.length > 0
                  ? Math.round((applications.filter(app => app.status === 'selected').length / applications.length) * 100)
                  : 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Selected per application</p>
            </CardContent>
          </Card>
        </div>

        {/* === Status Filter === */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Applications</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'all', label: 'All', color: 'blue' },
              { key: 'applied', label: 'Applied', color: 'yellow' },
              { key: 'interview', label: 'Interview', color: 'blue' },
              { key: 'selected', label: 'Selected', color: 'green' },
              { key: 'rejected', label: 'Rejected', color: 'red' },
            ].map(({ key, label, color }) => {
              const count = key === 'all'
                ? applications.length
                : applications.filter(app => app.status?.toLowerCase() === key).length;

              const isActive = statusFilter === key;
              const colorClasses = {
                blue: 'bg-blue-600 hover:bg-blue-700 text-white data-[state=outline]:text-blue-600 data-[state=outline]:border-blue-200',
                yellow: 'bg-yellow-600 hover:bg-yellow-700 text-white data-[state=outline]:text-yellow-600 data-[state=outline]:border-yellow-200',
                green: 'bg-green-600 hover:bg-green-700 text-white data-[state=outline]:text-green-600 data-[state=outline]:border-green-200',
                red: 'bg-red-600 hover:bg-red-700 text-white data-[state=outline]:text-red-600 data-[state=outline]:border-red-200',
              };

              return (
                <Button
                  key={key}
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(key)}
                  className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all ${colorClasses[color as keyof typeof colorClasses]}`}
                >
                  {label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* === Application List === */}
        {filteredApplications.length === 0 ? (
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="py-16 text-center">
              <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} apps`}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                {statusFilter === 'all'
                  ? 'Start your journey by applying to jobs or internships.'
                  : `You haven't received any ${statusFilter} applications yet.`}
              </p>
              {statusFilter === 'all' && (
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                  Browse Opportunities
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-xl font-bold text-gray-800">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-xl border border-gray-100 bg-white hover:bg-blue-50/60 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 shadow-sm">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">
                            {app.jobId?.title || 'Untitled Role'}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {app.companyId?.name || app.companyName || 'Private Company'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <span>{app.jobId?.location || 'Remote'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {getStatusBadge(app.status)}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
                            title="View Application"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </Button>
                          {app.resume && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
                              title="Download Resume"
                            >
                              <Download className="h-4 w-4 text-gray-600" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyApplications;