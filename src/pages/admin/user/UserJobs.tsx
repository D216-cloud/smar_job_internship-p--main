import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search, MapPin, Building, Clock, Briefcase, Filter, Target, Users, Globe, 
  Star, DollarSign, Eye, Calendar, Zap, Heart, Share2, AlertCircle, 
  TrendingUp, Grid, List, Sparkles, ChevronDown, ChevronUp, X, 
  Check, ArrowRight, Bookmark, BarChart2, Layers, Award, HardHat, 
  Code, Database, Cpu, Server, Smartphone, Palette, Music, Camera,
  Loader2, ExternalLink, ChevronLeft, ChevronRight, BarChart, Bell,
  MessageSquare, GitPullRequest, Shield, BatteryCharging, Wifi, Coffee,
  Sun, Moon, CheckCircle
} from 'lucide-react';
import { useAvailableJobs } from '@/hooks/useAvailableJobs';
import { useNavigate } from 'react-router-dom';
import { JobCard } from '@/components/user/JobCard';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export const UserJobs = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [salaryRange, setSalaryRange] = useState([50000]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);
  const [showSalaryComparison, setShowSalaryComparison] = useState(false);
  const [showSkillsAnalysis, setShowSkillsAnalysis] = useState(false);
  const [userSkills] = useState(['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  // removed dashboard cards: appliedJobsCount, savedJobsCount

  // Debounce search term manually
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Data hooks
  const { jobs, loading, error, totalJobs } = useAvailableJobs();
  const navigate = useNavigate();

  // Load saved and applied jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    const applied = localStorage.getItem('appliedJobs');
    if (saved) setSavedJobs(JSON.parse(saved));
    if (applied) setAppliedJobs(JSON.parse(applied));
  }, []);

  // removed backend application count (used only for removed cards)

  // removed savedJobsCount state; use savedJobs.length inline where needed

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  }, [savedJobs, appliedJobs]);

  // Filter jobs based on criteria
  const filteredJobs = useMemo(() => jobs.filter(job => {
    const matchesSearch = !debouncedSearchTerm || 
      job.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (typeof job.skills === 'string' && job.skills.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || 
      job.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesSalary = job.salary && parseInt(job.salary.replace(/[^\d]/g, '')) >= salaryRange[0];
    const matchesExperience = experienceFilter === 'all' || 
      (job.experienceLevel && job.experienceLevel.toLowerCase() === experienceFilter.toLowerCase());
    return matchesSearch && matchesLocation && matchesType && matchesSalary && matchesExperience;
  }), [jobs, debouncedSearchTerm, locationFilter, typeFilter, salaryRange, experienceFilter]);

  // Saved and applied jobs data
  const savedJobsData = useMemo(() => jobs.filter(job => savedJobs.includes(job._id)), [jobs, savedJobs]);
  const appliedJobsData = useMemo(() => jobs.filter(job => appliedJobs.includes(job._id)), [jobs, appliedJobs]);

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = useMemo(() => {
    const jobsToDisplay = activeTab === 'saved' ? savedJobsData : 
                         activeTab === 'applied' ? appliedJobsData : 
                         filteredJobs;
    return jobsToDisplay.slice(indexOfFirstJob, indexOfLastJob);
  }, [activeTab, savedJobsData, appliedJobsData, filteredJobs, indexOfFirstJob, indexOfLastJob]);

  const totalPages = Math.ceil(
    activeTab === 'saved' ? savedJobsData.length / jobsPerPage : 
    activeTab === 'applied' ? appliedJobsData.length / jobsPerPage : 
    filteredJobs.length / jobsPerPage
  );

  // Loading state
  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", darkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50")}>
        <div className="text-center space-y-4 animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Finding Your Dream Jobs</h3>
            <p className="text-gray-500">Analyzing {totalJobs} opportunities for the best matches</p>
            <Progress value={75} className="w-64 mx-auto h-2" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", darkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50")}>
        <Card className="max-w-md mx-auto border-red-200 bg-red-50 shadow-lg animate-fade-in">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Jobs</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Try Again
            </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="transition-all duration-300 transform hover:scale-105">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Toggle job save status
  const toggleSavedJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  // Apply to job
  const applyToJob = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
      setAppliedJobs([...appliedJobs, jobId]);
    }
    navigate(`/apply/${jobId}`);
  };

  // Share job
  const shareJob = (job: { _id: string; title: string; company: string }) => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        text: `Check out this job opportunity: ${job.title} at ${job.company}`,
        url: `${window.location.origin}/jobs/${job._id}`,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${window.location.origin}/jobs/${job._id}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className={cn("min-h-screen relative overflow-hidden transition-colors duration-300", darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900")}>
      {/* Background elements */}
      {!darkMode && (
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl transform rotate-12 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-cyan-200/40 to-pink-200/40 rounded-full blur-3xl transform -rotate-12 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      )}

      {/* Header Section */}
      <div className={cn("backdrop-blur-xl border-b relative z-10", darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white/30")}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                {activeTab === 'saved' ? 'Your Saved Jobs' : 
                 activeTab === 'applied' ? 'Application Tracker' : 
                 'Find Your Dream Job'}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                {activeTab === 'saved' ? 'Your curated list of opportunities' : 
                 activeTab === 'applied' ? 'Track your job applications' : 
                 'Discover the perfect opportunity tailored for your skills'}
              </p>
              </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setDarkMode(!darkMode)}
                      className="rounded-full transition-all duration-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                    >
                      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="outline" 
                className="gap-2 transition-all duration-300 hover:shadow-md"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              >
                <Bell className={cn("h-5 w-5", notificationsEnabled ? "text-blue-600 fill-blue-100" : "text-gray-400")} />
                {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
              </Button>
            </div>
          </div>

          {/* Quick Stats (trimmed) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105", darkMode ? "bg-gray-800" : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200")}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-lg transition-colors duration-300", darkMode ? "bg-gray-700" : "bg-blue-100")}>
                  <Briefcase className={cn("h-6 w-6", darkMode ? "text-blue-400" : "text-blue-600")} />
                </div>
                <div>
                  <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>Total Jobs</p>
                  <p className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-blue-800")}>{totalJobs}</p>
                </div>
              </CardContent>
            </Card>
    <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105", darkMode ? "bg-gray-800" : "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200")}> 
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-lg transition-colors duration-300", darkMode ? "bg-gray-700" : "bg-purple-100")}>
                  <Bookmark className={cn("h-6 w-6", darkMode ? "text-purple-400" : "text-purple-600")} />
                </div>
                <div>
                  <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>Saved Jobs</p>
      <p className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-purple-800")}>{savedJobs.length}</p>
                </div>
              </CardContent>
            </Card>
    {/* Removed Applied and Urgent Hires cards as requested */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Main Content Area */}
        <div className="flex flex-col">
          {/* Search and Filter Controls */}
          <div className="mb-8">
            <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg", darkMode ? "bg-gray-800" : "bg-white/90")}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setShowFilters(!showFilters)}
                      variant={showFilters ? "default" : "outline"}
                      className={cn("h-12 gap-2 rounded-xl transition-all duration-300 hover:shadow-md", showFilters ? "bg-gradient-to-r from-blue-600 to-purple-600" : "")}
                    >
                      <Filter className="h-5 w-5" />
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                      {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                    
                    <Select value={viewMode} onValueChange={(val: 'grid' | 'list') => setViewMode(val)}>
                      <SelectTrigger className={cn("w-28 h-12 rounded-xl transition-all duration-300", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                        <SelectValue placeholder="View" />
                      </SelectTrigger>
                      <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                        <SelectItem value="grid" className={darkMode ? "hover:bg-gray-700" : ""}>
                          <div className="flex items-center gap-2">
                            <Grid className="h-4 w-4" /> Grid
                          </div>
                        </SelectItem>
                        <SelectItem value="list" className={darkMode ? "hover:bg-gray-700" : ""}>
                          <div className="flex items-center gap-2">
                            <List className="h-4 w-4" /> List
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Location Filter */}
                <div>
                        <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                          <SelectTrigger className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                          <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                            <SelectItem value="all" className={darkMode ? "hover:bg-gray-700" : ""}>All Locations</SelectItem>
                            <SelectItem value="remote" className={darkMode ? "hover:bg-gray-700" : ""}>Remote</SelectItem>
                            <SelectItem value="san francisco" className={darkMode ? "hover:bg-gray-700" : ""}>San Francisco, CA</SelectItem>
                            <SelectItem value="new york" className={darkMode ? "hover:bg-gray-700" : ""}>New York, NY</SelectItem>
                            <SelectItem value="los angeles" className={darkMode ? "hover:bg-gray-700" : ""}>Los Angeles, CA</SelectItem>
                            <SelectItem value="boston" className={darkMode ? "hover:bg-gray-700" : ""}>Boston, MA</SelectItem>
                            <SelectItem value="chicago" className={darkMode ? "hover:bg-gray-700" : ""}>Chicago, IL</SelectItem>
                            <SelectItem value="austin" className={darkMode ? "hover:bg-gray-700" : ""}>Austin, TX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                      {/* Job Type Filter */}
                <div>
                        <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                    <Briefcase className="h-4 w-4" />
                    Job Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                          <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                            <SelectItem value="all" className={darkMode ? "hover:bg-gray-700" : ""}>All Types</SelectItem>
                            <SelectItem value="full-time" className={darkMode ? "hover:bg-gray-700" : ""}>Full-Time</SelectItem>
                            <SelectItem value="part-time" className={darkMode ? "hover:bg-gray-700" : ""}>Part-Time</SelectItem>
                            <SelectItem value="contract" className={darkMode ? "hover:bg-gray-700" : ""}>Contract</SelectItem>
                            <SelectItem value="internship" className={darkMode ? "hover:bg-gray-700" : ""}>Internship</SelectItem>
                            <SelectItem value="freelance" className={darkMode ? "hover:bg-gray-700" : ""}>Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Experience Level Filter */}
                      <div>
                        <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                          <Target className="h-4 w-4" />
                          Experience
                        </label>
                        <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                          <SelectTrigger className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-blue-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                            <SelectItem value="all" className={darkMode ? "hover:bg-gray-700" : ""}>All Levels</SelectItem>
                            <SelectItem value="entry" className={darkMode ? "hover:bg-gray-700" : ""}>Entry Level</SelectItem>
                            <SelectItem value="mid" className={darkMode ? "hover:bg-gray-700" : ""}>Mid Level</SelectItem>
                            <SelectItem value="senior" className={darkMode ? "hover:bg-gray-700" : ""}>Senior Level</SelectItem>
                            <SelectItem value="executive" className={darkMode ? "hover:bg-gray-700" : ""}>Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                      {/* Salary Range Filter */}
                <div>
                        <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                    <DollarSign className="h-4 w-4" />
                          Min Salary: ${salaryRange[0].toLocaleString()}
                  </label>
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                          max={250000}
                    min={30000}
                    step={5000}
                          className={cn("w-full transition-all duration-300", darkMode ? "[&_.slider-thumb]:bg-white [&_.slider-range]:bg-blue-500" : "")}
                  />
                </div>
                </div>

                    {/* Filter Actions */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                      <div className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
                        No advanced filters selected
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setLocationFilter('all');
                            setTypeFilter('all');
                            setExperienceFilter('all');
                            setSalaryRange([50000]);
                          }}
                          className={cn("transition-all duration-300 hover:shadow-md", darkMode ? "text-gray-300 hover:bg-gray-700" : "")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reset All
                        </Button>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:shadow-md"
                          onClick={() => setShowFilters(false)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Job Listings Section */}
              <div>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className={cn("transition-all duration-300", darkMode ? "bg-gray-700" : "")}>
                    <TabsTrigger value="all" className={cn("transition-colors duration-300", darkMode ? "data-[state=active]:bg-gray-600" : "")}>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        All Jobs
                        <Badge variant="secondary" className="ml-1">
                          {filteredJobs.length}
                        </Badge>
                  </div>
                    </TabsTrigger>
                    <TabsTrigger value="saved" className={cn("transition-colors duration-300", darkMode ? "data-[state=active]:bg-gray-600" : "")}>
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Saved Jobs
                        <Badge variant="secondary" className="ml-1">
                          {savedJobs.length}
                        </Badge>
                  </div>
                    </TabsTrigger>
                    <TabsTrigger value="applied" className={cn("transition-colors duration-300", darkMode ? "data-[state=active]:bg-gray-600" : "")}>
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="h-4 w-4" />
                        Applied
                        <Badge variant="secondary" className="ml-1">
                          {appliedJobs.length}
                        </Badge>
                </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
                  Showing {currentJobs.length} of{' '}
                  {activeTab === 'saved' ? savedJobsData.length : 
                   activeTab === 'applied' ? appliedJobsData.length : 
                   filteredJobs.length} jobs
                </div>
                <Select>
                  <SelectTrigger className={cn("w-48 h-10 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                    <SelectValue placeholder="Sort by: Recommended" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                    <SelectItem value="recommended" className={darkMode ? "hover:bg-gray-700" : ""}>Recommended</SelectItem>
                    <SelectItem value="newest" className={darkMode ? "hover:bg-gray-700" : ""}>Newest First</SelectItem>
                    <SelectItem value="salary-high" className={darkMode ? "hover:bg-gray-700" : ""}>Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low" className={darkMode ? "hover:bg-gray-700" : ""}>Salary: Low to High</SelectItem>
                    <SelectItem value="relevance" className={darkMode ? "hover:bg-gray-700" : ""}>Most Relevant</SelectItem>
                    <SelectItem value="popular" className={darkMode ? "hover:bg-gray-700" : ""}>Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Application Tracker for Applied Tab */}
            {activeTab === 'applied' && (
              <div className="mb-8">
                <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg", darkMode ? "bg-gray-800" : "bg-white/90")}>
                  <CardContent className="p-4">
                    <h3 className={cn("text-lg font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>
                      Application Tracker
                    </h3>
                    <p className={cn("text-sm text-gray-600 mb-4", darkMode ? "text-gray-400" : "text-gray-600")}>
                      Track your job applications and their status.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 transition-all duration-300 hover:shadow-md">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Total Applications</p>
                          <p className="text-lg font-bold text-blue-800">{appliedJobs.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 transition-all duration-300 hover:shadow-md">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Applications Submitted</p>
                          <p className="text-lg font-bold text-green-800">{appliedJobs.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 transition-all duration-300 hover:shadow-md">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Average Response Time</p>
                          <p className="text-lg font-bold text-yellow-800">2-3 weeks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 transition-all duration-300 hover:shadow-md">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Rejections</p>
                          <p className="text-lg font-bold text-red-800">0</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Toggle */}
            {activeTab !== 'applied' && (
              <div className="flex items-center justify-end gap-4 mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSalaryComparison(!showSalaryComparison)}
                  className={cn("gap-2 transition-all duration-300 hover:shadow-md", darkMode ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "")}
                >
                  <BarChart className="h-4 w-4" />
                  {showSalaryComparison ? 'Hide Salary Comparison' : 'Show Salary Comparison'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSkillsAnalysis(!showSkillsAnalysis)}
                  className={cn("gap-2 transition-all duration-300 hover:shadow-md", darkMode ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "")}
                >
                  <Shield className="h-4 w-4" />
                  {showSkillsAnalysis ? 'Hide Skills Analysis' : 'Show Skills Analysis'}
                </Button>
              </div>
            )}

            {/* Salary Comparison Chart */}
            {showSalaryComparison && activeTab !== 'applied' && (
              <div className="mb-8">
                <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg", darkMode ? "bg-gray-800" : "bg-white/90")}>
                  <CardContent className="p-4">
                    <h3 className={cn("text-lg font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>
                      Salary Comparison
                    </h3>
                    <p className={cn("text-sm text-gray-600 mb-4", darkMode ? "text-gray-400" : "text-gray-600")}>
                      Compare average salaries across different industries and experience levels.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 transition-all duration-300 hover:shadow-md">
                        <Code className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Technology</p>
                          <p className="text-lg font-bold text-blue-800">$120,000</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 transition-all duration-300 hover:shadow-md">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Finance</p>
                          <p className="text-lg font-bold text-purple-800">$100,000</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 transition-all duration-300 hover:shadow-md">
                        <HardHat className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Healthcare</p>
                          <p className="text-lg font-bold text-green-800">$90,000</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 transition-all duration-300 hover:shadow-md">
                        <Users className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Education</p>
                          <p className="text-lg font-bold text-red-800">$70,000</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Skills Radar Chart */}
            {showSkillsAnalysis && activeTab !== 'applied' && (
              <div className="mb-8">
                <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg", darkMode ? "bg-gray-800" : "bg-white/90")}>
                  <CardContent className="p-4">
                    <h3 className={cn("text-lg font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>
                      Skills Analysis
                    </h3>
                    <p className={cn("text-sm text-gray-600 mb-4", darkMode ? "text-gray-400" : "text-gray-600")}>
                      Visualize your skills against common job requirements.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 transition-all duration-300 hover:shadow-md">
                        <Code className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Frontend</p>
                          <p className="text-lg font-bold text-yellow-800">85%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 transition-all duration-300 hover:shadow-md">
                        <Database className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Backend</p>
                          <p className="text-lg font-bold text-blue-800">75%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 transition-all duration-300 hover:shadow-md">
                        <Cpu className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">DevOps</p>
                          <p className="text-lg font-bold text-purple-800">65%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 transition-all duration-300 hover:shadow-md">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Mobile</p>
                          <p className="text-lg font-bold text-green-800">55%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Job Listings */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentJobs.map((job) => (
                  <JobCard 
                    key={job._id} 
                    job={{
                      id: job._id,
                      title: job.title,
                      company: job.company,
                      location: job.location,
                      type: job.type,
                      salary: job.salary,
                      postedDate: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '',
                      description: job.description,
                      logo: job.logo,
                      isRemote: job.isRemote,
                      isUrgent: job.isUrgent,
                      skills: typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : Array.isArray(job.skills) ? job.skills : [],
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentJobs.map((job) => (
                  <Card 
                    key={job._id} 
                    className={cn(
                      "transition-all duration-300 group shadow-md hover:shadow-xl",
                      darkMode ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "hover:border-blue-300"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-shrink-0 relative">
                            <img
                              src={job.logo || '/placeholder.svg'}
                              alt={`${job.company} logo`}
                            className={cn(
                              "w-16 h-16 rounded-xl object-cover border transition-transform duration-300 group-hover:scale-105",
                              darkMode ? "border-gray-700" : "border-gray-200",
                            )}
                            />
                          </div>
                          <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div>
                              <h3 className={cn(
                                "text-xl font-semibold transition-colors duration-300",
                                darkMode ? "group-hover:text-blue-400" : "group-hover:text-blue-600"
                              )}>
                                {job.title}
                              </h3>
                              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>{job.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="secondary" 
                                className={darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"}
                              >
                                {job.type}
                              </Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => toggleSavedJob(job._id)}
                                      className="rounded-full transition-all duration-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                                    >
                                      <Heart 
                                        className={cn(
                                          "h-5 w-5 transition-colors duration-300",
                                          savedJobs.includes(job._id) ? "fill-red-500 text-red-500" : 
                                          darkMode ? "text-gray-400" : "text-gray-400"
                                        )} 
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {savedJobs.includes(job._id) ? 'Remove from saved' : 'Save this job'}
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => shareJob({ _id: job._id!, title: job.title, company: job.company })}
                                      className="rounded-full transition-all duration-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                                    >
                                      <Share2 className={cn("h-5 w-5", darkMode ? "text-gray-400" : "text-gray-400")} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Share this job
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant="outline" className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "border-gray-700 bg-gray-700" : "")}>
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </Badge>
                            <Badge variant="outline" className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "border-gray-700 bg-gray-700" : "")}>
                              <DollarSign className="h-3 w-3" />
                              {job.salary}
                          </Badge>
                            {job.isRemote && (
                              <Badge variant="outline" className={cn("transition-colors duration-300", darkMode ? "bg-green-900/30 text-green-400 border-green-800" : "bg-green-50 text-green-700")}>
                                <Globe className="h-3 w-3" />
                                Remote
                              </Badge>
                            )}
                            {job.isUrgent && (
                              <Badge variant="outline" className={cn("transition-colors duration-300", darkMode ? "bg-red-900/30 text-red-400 border-red-800" : "bg-red-50 text-red-700")}>
                                <Zap className="h-3 w-3" />
                                Urgent
                              </Badge>
                            )}
                            {job.experienceLevel && (
                              <Badge variant="outline" className={cn("transition-colors duration-300", darkMode ? "bg-purple-900/30 text-purple-400 border-purple-800" : "bg-purple-50 text-purple-700")}>
                                <Award className="h-3 w-3" />
                                {job.experienceLevel}
                              </Badge>
                            )}
                          </div>
                          
                          <p className={cn("mb-4 line-clamp-2 transition-colors duration-300", darkMode ? "text-gray-300" : "text-gray-600")}>
                        {job.description}
                      </p>
                          
                          {/* Company Culture & Benefits Preview */}
                          {Array.isArray(job.benefits) && job.benefits.length > 0 && (
                            <Card className={cn("border-0 shadow-sm transition-all duration-300", darkMode ? "bg-gray-800" : "bg-white/90")}>
                              <CardContent className="p-4">
                                <h3 className={cn("text-lg font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>
                                  Company Culture & Benefits
                                </h3>
                                <p className={cn("text-sm text-gray-600 mb-4", darkMode ? "text-gray-400" : "text-gray-600")}>
                                  Discover what makes this company a great place to work.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {job.benefits.map((benefit, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className={cn(
                                        "flex items-center gap-1 transition-colors duration-300",
                                        darkMode ? "border-gray-700 bg-gray-700" : ""
                                      )}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      {benefit}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-sm">
                              <span className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "text-gray-400" : "text-gray-500")}>
                                <Clock className="h-4 w-4" />
                            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                              <span className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "text-gray-400" : "text-gray-500")}>
                                <Eye className="h-4 w-4" />
                            {job.views || 0} views
                          </span>
                        </div>
                        <div className="flex gap-2">
                              {appliedJobs.includes(job._id) ? (
                                <Button 
                                  variant="outline" 
                                  className={cn("gap-2 transition-all duration-300 hover:shadow-md", darkMode ? "border-green-700 text-green-400" : "border-green-200 text-green-700")}
                                >
                                  <Check className="h-4 w-4" />
                                  Applied
                          </Button>
                              ) : (
                          <Button 
                                  onClick={() => applyToJob(job._id)}
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg gap-2 transition-all duration-300 hover:shadow-md hover:scale-105"
                          >
                            Apply Now
                                  <ArrowRight className="h-4 w-4" />
                          </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {currentJobs.length === 0 && (
              <Card className={cn("text-center py-16 shadow-md", darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90")}>
                <CardContent>
                  <div className={cn("p-4 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-300", darkMode ? "bg-gray-700" : "bg-gray-100")}>
                    <Briefcase className={cn("h-8 w-8", darkMode ? "text-gray-400" : "text-gray-400")} />
                  </div>
                  <h3 className={cn("text-xl font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>
                    {activeTab === 'saved' ? 'No saved jobs yet' : 
                     activeTab === 'applied' ? 'No applications yet' : 
                     'No jobs found'}
                  </h3>
                  <p className={cn("max-w-md mx-auto mb-6", darkMode ? "text-gray-400" : "text-gray-600")}>
                    {activeTab === 'saved' 
                      ? "You haven't saved any jobs yet. When you find interesting opportunities, click the bookmark icon to save them."
                      : activeTab === 'applied'
                      ? "You haven't applied to any jobs yet. Start applying to track your progress here."
                      : (searchTerm || locationFilter !== 'all' || typeFilter !== 'all' 
                      ? "No jobs match your current filters. Try adjusting your search criteria."
                          : "No jobs are currently available. Check back later for new opportunities!")
                    }
                  </p>
                  {activeTab !== 'saved' && activeTab !== 'applied' && (
                    <div className="flex gap-3 justify-center">
                    <Button 
                        variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setLocationFilter('all');
                        setTypeFilter('all');
                        setExperienceFilter('all');
                        setSalaryRange([50000]);
                      }}
                        className={cn("gap-2 transition-all duration-300 hover:shadow-md hover:scale-105", darkMode ? "border-gray-600 hover:bg-gray-700" : "")}
                      >
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
                      <Button 
                        variant="default"
                        onClick={() => setActiveTab('all')}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:shadow-md hover:scale-105"
                      >
                        <Briefcase className="h-4 w-4" />
                        Browse All Jobs
                      </Button>
                    </div>
                  )}
                  {activeTab === 'saved' && (
                    <Button 
                      variant="default"
                      onClick={() => setActiveTab('all')}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                      <Briefcase className="h-4 w-4" />
                      Browse Jobs
                    </Button>
                  )}
                  {activeTab === 'applied' && (
                    <Button 
                      variant="default"
                      onClick={() => setActiveTab('all')}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                      <Briefcase className="h-4 w-4" />
                      Find Jobs to Apply
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {currentJobs.length > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={cn("transition-all duration-300 hover:shadow-md", darkMode ? "border-gray-600 hover:bg-gray-700" : "")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <Button
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              "transition-all duration-300 hover:shadow-md",
                              currentPage !== pageNum && darkMode ? "border-gray-600 hover:bg-gray-700" : "",
                              currentPage === pageNum ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""
                            )}
                          >
                            {pageNum}
                          </Button>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <span className={cn("px-2", darkMode ? "text-gray-400" : "text-gray-500")}>...</span>
                      </PaginationItem>
                    )}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className={cn("transition-all duration-300 hover:shadow-md", darkMode ? "border-gray-600 hover:bg-gray-700" : "")}
                        >
                          {totalPages}
                        </Button>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={cn("transition-all duration-300 hover:shadow-md", darkMode ? "border-gray-600 hover:bg-gray-700" : "")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};