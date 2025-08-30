import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, Briefcase, Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

export const Interviews = () => {
  const { userData } = useAuthContext();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = userData?._id || userData?.id;
    if (!userId) return;
    setLoading(true);
    
    console.log('Fetching interviews for user:', userId);
    
    fetch(`/api/applications/user/${userId}`, {
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
        // Filter applications with interview status
        const interviewApplications = Array.isArray(data) 
          ? data.filter(app => app.status === 'interview')
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
        <div className="text-center space-y-4 animate-fade-in">
          <Clock className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <h3 className="text-xl font-semibold mt-4">Loading your interviews...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50 shadow-lg animate-fade-in">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Interviews</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">My Interviews</h1>
          </div>
          <Badge variant="outline" className="text-base md:text-lg font-bold px-3 py-2 shadow-md bg-white/80">
            {interviews.length} Scheduled
          </Badge>
        </div>
        {interviews.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-2xl animate-fade-in">
            <CardContent className="text-center py-8 sm:py-12">
              <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No interviews scheduled</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">You have not been scheduled for any interviews yet. Companies will schedule interviews when they review your applications.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm rounded-2xl animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold">Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pb-2">
              <div className="w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                <Table className="min-w-full text-sm">
                  <TableHeader className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
                    <TableRow>
                      <TableHead className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700">Job Title</TableHead>
                      <TableHead className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700">Company</TableHead>
                      <TableHead className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview: any) => (
                      <TableRow key={interview._id} className="hover:bg-blue-50/40 transition-colors duration-200 rounded-xl">
                        <TableCell className="font-bold text-blue-700 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">
                          {interview.jobId?.title || 'Job Title'}
                        </TableCell>
                        <TableCell className="font-medium text-gray-700 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">
                          {interview.companyId?.name || interview.companyName || 'Company'}
                        </TableCell>
                        <TableCell className="text-gray-600 whitespace-nowrap px-2 py-3 text-xs sm:text-sm">
                          {new Date(interview.appliedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200">
                            Interview Scheduled
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-2 py-3 text-xs sm:text-sm">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-xl px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 hover:shadow-md"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="rounded-xl px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 hover:shadow-md"
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