import { useEffect, useState } from 'react';

interface Interview {
  _id: string;
  jobId?: { title?: string };
  companyId?: { name?: string };
  companyName?: string;
  appliedAt: string;
  status: string;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

export const Interviews = () => {
  const { userData } = useAuthContext();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = userData?._id || userData?.id;
    if (!userId) return;
    setLoading(true);
    
    console.log('Fetching interviews for user:', userId);
    
  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/applications/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        console.log('Interviews API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('All applications data:', data);
        const interviewApplications = Array.isArray(data) 
          ? data.filter(app => ['interview', 'selected', 'rejected'].includes(app.status))
          : [];
        console.log('Interview applications:', interviewApplications);
        setInterviews(interviewApplications);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching interviews:', err);
        setError('Failed to load interviews');
        setLoading(false);
      });
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-5 animate-in fade-in duration-500">
          <Clock className="h-14 w-14 animate-spin mx-auto text-blue-600" />
          <h3 className="text-2xl font-semibold text-gray-800">Loading your interviews...</h3>
          <p className="text-gray-500 text-sm">Fetching scheduled sessions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md mx-auto border-0 shadow-xl bg-white/90 backdrop-blur-md animate-in fade-in duration-500">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-14 w-14 text-red-500 mx-auto mb-5 animate-bounce" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6 text-sm">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
              My Interviews
            </h1>
          </div>
          <Badge 
            variant="secondary" 
            className="text-sm md:text-base font-bold px-4 py-2.5 shadow-md bg-white/80 border border-gray-200 text-gray-800"
          >
            {interviews.length} {interviews.length === 1 ? 'Interview' : 'Interviews'} Scheduled
          </Badge>
        </div>

        {/* Empty State */}
        {interviews.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <CardContent className="text-center py-12 px-6">
              <div className="p-5 rounded-full bg-gray-100 w-20 h-20 mx-auto mb-5 flex items-center justify-center shadow-sm">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">No interviews scheduled yet</h3>
              <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
                Once companies review your applications, they may schedule interviews. 
                Keep applying to increase your chances!
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Interview List Table */
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-2">
              <div 
                className="w-full"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <Table className="min-w-full text-sm">
                  <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 tracking-wide uppercase">
                        Job Title
                      </TableHead>
                      <TableHead className="px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 tracking-wide uppercase">
                        Company
                      </TableHead>
                      <TableHead className="px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 tracking-wide uppercase">
                        Scheduled On
                      </TableHead>
                      <TableHead className="px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 tracking-wide uppercase">
                        Status
                      </TableHead>
                      <TableHead className="px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 tracking-wide uppercase">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview) => (
                      <TableRow 
                        key={interview._id} 
                        className="hover:bg-blue-50/60 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                      >
                        <TableCell className="font-semibold text-blue-700 px-3 py-3 text-sm">
                          {interview.jobId?.title || 'Job Title Not Available'}
                        </TableCell>
                        <TableCell className="font-medium text-gray-700 px-3 py-3 text-sm">
                          {interview.companyId?.name || interview.companyName || 'Private Company'}
                        </TableCell>
                        <TableCell className="text-gray-600 px-3 py-3 text-sm">
                          {new Date(interview.appliedAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm">
                          {interview.status === 'interview' && (
                            <Badge className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 hover:from-blue-200 border border-blue-200 shadow-sm px-3 py-1.5 rounded-full font-medium">
                              📅 Interview Scheduled
                            </Badge>
                          )}
                          {interview.status === 'selected' && (
                            <Badge className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 hover:from-green-200 border border-green-200 shadow-sm px-3 py-1.5 rounded-full font-medium">
                              ✅ Selected
                            </Badge>
                          )}
                          {interview.status === 'rejected' && (
                            <Badge className="bg-gradient-to-r from-red-100 to-red-50 text-red-700 hover:from-red-200 border border-red-200 shadow-sm px-3 py-1.5 rounded-full font-medium">
                              ❌ Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-10 w-10 p-0 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 shadow-sm"
                              title="View Application"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-10 w-10 p-0 rounded-full hover:bg-green-100 hover:text-green-600 transition-all duration-200 shadow-sm"
                              title="Send Message"
                            >
                              <MessageSquare className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Interviews;