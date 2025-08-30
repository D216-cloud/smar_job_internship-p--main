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
  TableRow 
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
  TrendingUp
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
    console.log('UserData in MyApplications:', userData);
    console.log('UserData keys:', userData ? Object.keys(userData) : 'No userData');
    
    const userId = userData?._id || userData?.id;
    if (!userId) {
      console.log('No user ID available:', userData);
      return;
    }
    
    console.log('Fetching applications for user:', userId);
    setLoading(true);
    
    fetch(`/api/applications/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        console.log('Applications API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Applications data received:', data);
        const apps = Array.isArray(data) ? data : [];
        console.log('Processed applications:', apps);
        console.log('Applications with interview status:', apps.filter(app => app.status === 'interview'));
        console.log('Applications with selected status:', apps.filter(app => app.status === 'selected'));
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
        return <Badge className="bg-green-100/80 text-green-700 hover:bg-green-200 rounded-full px-3 py-1 text-xs">Selected</Badge>;
      case 'rejected':
      case 'declined':
        return <Badge className="bg-red-100/80 text-red-700 hover:bg-red-200 rounded-full px-3 py-1 text-xs">Rejected</Badge>;
      case 'interview':
      case 'shortlisted':
        return <Badge className="bg-blue-100/80 text-blue-700 hover:bg-blue-200 rounded-full px-3 py-1 text-xs">Interview</Badge>;
      case 'pending':
      case 'applied':
      default:
        return <Badge className="bg-yellow-100/80 text-yellow-700 hover:bg-yellow-200 rounded-full px-3 py-1 text-xs">Applied</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selected':
      case 'hired':
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'interview':
      case 'shortlisted':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg border-none p-8 transition-all duration-300">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="p-3 rounded-full bg-blue-100/80 shadow-sm">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">My Applications</h1>
                <p className="text-gray-600 text-base">Track and manage your job applications</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-5">
              <CardTitle className="text-lg font-semibold text-gray-800">Total Applications</CardTitle>
              <div className="p-2 rounded-full bg-blue-100/80">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-3xl font-bold text-blue-600">{applications.length}</div>
              <p className="text-sm text-gray-500 mt-1">All submitted applications</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-5">
              <CardTitle className="text-lg font-semibold text-gray-800">Interviews</CardTitle>
              <div className="p-2 rounded-full bg-green-100/80">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-3xl font-bold text-green-600">{applications.filter(app => app.status === 'interview').length}</div>
              <p className="text-sm text-gray-500 mt-1">Interview scheduled</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-5">
              <CardTitle className="text-lg font-semibold text-gray-800">Selected</CardTitle>
              <div className="p-2 rounded-full bg-purple-100/80">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-3xl font-bold text-purple-600">{applications.filter(app => app.status === 'selected').length}</div>
              <p className="text-sm text-gray-500 mt-1">Job offers received</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 px-5">
              <CardTitle className="text-lg font-semibold text-gray-800">Success Rate</CardTitle>
              <div className="p-2 rounded-full bg-orange-100/80">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="px-5">
              <div className="text-3xl font-bold text-orange-600">
                {applications.length > 0 ? Math.round((applications.filter(app => app.status === 'selected').length / applications.length) * 100) : 0}%
              </div>
              <p className="text-sm text-gray-500 mt-1">Selection success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Status Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg border-none p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 tracking-tight">Filter by Status</h3>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')} className="rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white data-[state=outline]:bg-white data-[state=outline]:text-blue-600 data-[state=outline]:border-blue-200">
              All ({applications.length})
            </Button>
            <Button size="sm" variant={statusFilter === 'applied' ? 'default' : 'outline'} onClick={() => setStatusFilter('applied')} className="rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white data-[state=outline]:bg-white data-[state=outline]:text-blue-600 data-[state=outline]:border-blue-200">
              Applied ({applications.filter(app => app.status?.toLowerCase() === 'applied').length})
            </Button>
            <Button size="sm" variant={statusFilter === 'interview' ? 'default' : 'outline'} onClick={() => setStatusFilter('interview')} className="rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white data-[state=outline]:bg-white data-[state=outline]:text-blue-600 data-[state=outline]:border-blue-200">
              Interview ({applications.filter(app => app.status?.toLowerCase() === 'interview').length})
            </Button>
            <Button size="sm" variant={statusFilter === 'selected' ? 'default' : 'outline'} onClick={() => setStatusFilter('selected')} className="rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white data-[state=outline]:bg-white data-[state=outline]:text-blue-600 data-[state=outline]:border-blue-200">
              Selected ({applications.filter(app => app.status?.toLowerCase() === 'selected').length})
            </Button>
            <Button size="sm" variant={statusFilter === 'rejected' ? 'default' : 'outline'} onClick={() => setStatusFilter('rejected')} className="rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white data-[state=outline]:bg-white data-[state=outline]:text-blue-600 data-[state=outline]:border-blue-200">
              Rejected ({applications.filter(app => app.status?.toLowerCase() === 'rejected').length})
            </Button>
          </div>
        </div>

        {/* Enhanced Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="text-center py-16">
              <div className="p-4 rounded-full bg-gray-100/80 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {statusFilter === 'all' ? 'No applications yet' : `No ${statusFilter} applications`}
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                {statusFilter === 'all' 
                  ? 'Start your journey by applying to opportunities!' 
                  : `You don't have any ${statusFilter} applications yet.`
                }
              </p>
              {statusFilter === 'all' && (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm">
                  Browse Jobs
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="px-6">
              <CardTitle className="text-xl font-semibold text-gray-800 tracking-tight">Applications Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-6">
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-100/80">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {app.jobId?.title || 'Job Title Not Available'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {app.companyId?.name || app.companyName || 'Company Not Available'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{app.jobId?.location || 'Remote'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full border-gray-200 hover:bg-gray-50">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                        {app.resume && (
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full border-gray-200 hover:bg-gray-50">
                            <Download className="h-4 w-4 text-gray-600" />
                          </Button>
                        )}
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