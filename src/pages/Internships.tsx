import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search,
  MapPin, 
  Building, 
  Clock, 
  Briefcase, Filter, Target, Users, Globe, 
  Star, DollarSign, Eye, Calendar, Zap, Heart, Share2, AlertCircle, 
  TrendingUp, Grid, List, Sparkles, ChevronDown, ChevronUp, X, 
  Check, ArrowRight, Bookmark, BarChart2, Layers, Award, HardHat, 
  Code, Database, Cpu, Server, Smartphone, Palette, Music, Camera,
  Loader2, ExternalLink, ChevronLeft, ChevronRight, BarChart, Bell,
  Sun, Moon, CheckCircle, BookOpen, Shield
} from 'lucide-react';
import { getAllInternships } from '@/data/jobsData';
import { useNavigate } from 'react-router-dom';
import { JobCard } from '@/components/user/JobCard';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';

export const Internships = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all-locations');
  const [termFilter, setTermFilter] = useState('all-terms');
  const [salaryRange, setSalaryRange] = useState([0]);
  const [experienceLevel, setExperienceLevel] = useState('all-levels');
  const [companyType, setCompanyType] = useState('all-types');
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [benefitsFilter, setBenefitsFilter] = useState<string[]>([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [savedInternships, setSavedInternships] = useState<string[]>([]);
  const [appliedInternships, setAppliedInternships] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [internshipsPerPage] = useState(12);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showSalaryComparison, setShowSalaryComparison] = useState(false);
  const [showSkillsAnalysis, setShowSkillsAnalysis] = useState(false);
  // removed backend applied count and separate saved count used only for removed cards
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const response = await fetch('/api/internships');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setInternships(data);
      } catch (err) {
        console.warn('API not available, using sample data:', err);
        const localInternships = getAllInternships();
        setInternships(localInternships);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  // Load saved and applied internships from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedInternships');
    const applied = localStorage.getItem('appliedInternships');
    if (saved) setSavedInternships(JSON.parse(saved));
    if (applied) setAppliedInternships(JSON.parse(applied));
  }, []);

  // removed backend applied count fetch; local state still used for applied list actions

  // Update saved internships count
  // saved count now computed inline where needed

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('savedInternships', JSON.stringify(savedInternships));
    localStorage.setItem('appliedInternships', JSON.stringify(appliedInternships));
  }, [savedInternships, appliedInternships]);

  // Filter internships
  const filteredInternships = useMemo(() => internships.filter(internship => {
    const matchesSearch = !debouncedSearchTerm ||
      internship.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      internship.company?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (internship.tags && internship.tags.some(tag => tag.toLowerCase().includes(debouncedSearchTerm.toLowerCase())));
    const matchesLocation = locationFilter === 'all-locations' ||
      (internship.location && internship.location.toLowerCase().includes(locationFilter.toLowerCase())) ||
      (locationFilter === 'remote' && internship.remote);
    const matchesTerm = termFilter === 'all-terms' ||
      (internship.type && internship.type.toLowerCase().includes(termFilter.toLowerCase()));
    const matchesSalary = salaryRange[0] === 0 || (() => {
      const stipend = internship.stipend || internship.salary || '';
      const stipendAmount = parseInt((stipend || '').replace(/\D/g, ''));
      return stipendAmount >= salaryRange[0];
    })();
    const matchesExperience = experienceLevel === 'all-levels' || internship.experienceLevel === experienceLevel;
    const matchesCompanyType = companyType === 'all-types' || internship.companyType === companyType;
    const matchesIndustry = industryFilter.length === 0 ||
      (internship.industry && industryFilter.includes(internship.industry.toLowerCase()));
    const matchesBenefits = benefitsFilter.length === 0 ||
      (internship.benefits && benefitsFilter.every(b => internship.benefits.includes(b)));
    return matchesSearch && matchesLocation && matchesTerm && matchesSalary &&
      matchesExperience && matchesCompanyType && matchesIndustry && matchesBenefits;
  }), [internships, debouncedSearchTerm, locationFilter, termFilter, salaryRange, experienceLevel, companyType, industryFilter, benefitsFilter]);

  // Saved internships data
  const savedInternshipsData = useMemo(() => internships.filter(internship => savedInternships.includes(internship._id)), [internships, savedInternships]);
  // Applied internships data
  const appliedInternshipsData = useMemo(() => internships.filter(internship => appliedInternships.includes(internship._id)), [internships, appliedInternships]);

  // Displayed internships by tab
  const displayedInternships = useMemo(() => {
    if (activeTab === 'saved') return savedInternshipsData;
    if (activeTab === 'applied') return appliedInternshipsData;
    return filteredInternships;
  }, [activeTab, savedInternshipsData, appliedInternshipsData, filteredInternships]);

  // Pagination logic
  const indexOfLastInternship = currentPage * internshipsPerPage;
  const indexOfFirstInternship = indexOfLastInternship - internshipsPerPage;
  const currentInternships = useMemo(() => displayedInternships.slice(indexOfFirstInternship, indexOfLastInternship), [displayedInternships, indexOfFirstInternship, indexOfLastInternship]);
  const totalPages = Math.ceil(displayedInternships.length / internshipsPerPage);

  // Toggle save
  const toggleSavedInternship = (internshipId: string) => {
    setSavedInternships(prev =>
      prev.includes(internshipId) ? prev.filter(id => id !== internshipId) : [...prev, internshipId]
    );
  };

  // Share internship
  interface Internship {
    _id: string;
    title: string;
    company: string;
    location?: string;
    type?: string;
    stipend?: string;
    salary?: string;
    tags?: string[];
    remote?: boolean;
    isUrgent?: boolean;
    experienceLevel?: string;
    companyType?: string;
    industry?: string;
    benefits?: string[];
    description?: string;
    logo?: string;
    createdAt?: string;
    views?: number;
    skills?: string[] | string;
  }

  const shareInternship = (internship: Internship) => {
    if (navigator.share) {
      navigator.share({
        title: `${internship.title} at ${internship.company}`,
        text: `Check out this internship opportunity: ${internship.title} at ${internship.company}`,
        url: `${window.location.origin}/internships/${internship._id}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/internships/${internship._id}`);
      alert('Link copied to clipboard!');
    }
  };

  // Apply to internship
  const applyToInternship = (internshipId: string) => {
    if (!appliedInternships.includes(internshipId)) {
      setAppliedInternships([...appliedInternships, internshipId]);
    }
    navigate(`/user/apply/${internshipId}`);
  };

  // Industry and benefits (same as before)
  const industries = [
    { value: 'tech', label: 'Technology', icon: <Code className="h-4 w-4" /> },
    { value: 'finance', label: 'Finance', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'healthcare', label: 'Healthcare', icon: <HardHat className="h-4 w-4" /> },
    { value: 'education', label: 'Education', icon: <Bookmark className="h-4 w-4" /> },
    { value: 'marketing', label: 'Marketing', icon: <BarChart2 className="h-4 w-4" /> },
    { value: 'design', label: 'Design', icon: <Palette className="h-4 w-4" /> },
    { value: 'entertainment', label: 'Entertainment', icon: <Music className="h-4 w-4" /> },
    { value: 'manufacturing', label: 'Manufacturing', icon: <Layers className="h-4 w-4" /> },
  ];
  const benefits = [
    { value: 'mentorship', label: 'Mentorship', icon: <Users className="h-4 w-4" /> },
    { value: 'housing', label: 'Housing Stipend', icon: <Building className="h-4 w-4" /> },
    { value: 'transportation', label: 'Transportation', icon: <Globe className="h-4 w-4" /> },
    { value: 'flexible', label: 'Flexible Hours', icon: <Clock className="h-4 w-4" /> },
    { value: 'paid', label: 'Paid', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'credit', label: 'Academic Credit', icon: <BookOpen className="h-4 w-4" /> },
    { value: 'fulltime', label: 'Full-time Offer', icon: <Briefcase className="h-4 w-4" /> },
  ];

  // Loading state
  if (loading) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", darkMode ? "bg-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50")}>
        <div className="text-center space-y-4 animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-600" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Finding Premium Internships</h3>
            <p className="text-gray-500">Analyzing opportunities for the best matches</p>
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
            <h3 className="text-lg font-semibold mb-2">Error Loading Internships</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
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

  return (
    <div className={cn("min-h-screen relative overflow-hidden transition-colors duration-300", darkMode ? "bg-gray-900 text-gray-100" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900")}>
      {/* Background elements */}
      {!darkMode && (
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-emerald-200/40 to-green-200/40 rounded-full blur-3xl transform rotate-12 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-teal-200/40 to-cyan-200/40 rounded-full blur-3xl transform -rotate-12 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      )}

      {/* Header Section */}
      <div className={cn("backdrop-blur-xl border-b relative z-10", darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white/30")}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                {activeTab === 'saved' ? 'Your Saved Internships' : 'Find your dream Internships'}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                {activeTab === 'saved' ? 'Your curated list of opportunities' : 'Discover career-launching opportunities at world\'s leading companies'}
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
                <Bell className={cn("h-5 w-5", notificationsEnabled ? "text-emerald-600 fill-emerald-100" : "text-gray-400")} />
                {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
              </Button>
        </div>
      </div>

          {/* Quick Stats */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105", darkMode ? "bg-gray-800" : "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200")}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-lg transition-colors duration-300", darkMode ? "bg-gray-700" : "bg-emerald-100")}>
                  <BookOpen className={cn("h-6 w-6", darkMode ? "text-emerald-400" : "text-emerald-600")} />
              </div>
              <div>
                  <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>Total Internships</p>
                  <p className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-emerald-800")}>{internships.length}</p>
              </div>
            </CardContent>
          </Card>
            <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105", darkMode ? "bg-gray-800" : "bg-gradient-to-r from-green-50 to-green-100 border-green-200")}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-lg transition-colors duration-300", darkMode ? "bg-gray-700" : "bg-green-100")}>
                  <Bookmark className={cn("h-6 w-6", darkMode ? "text-green-400" : "text-green-600")} />
              </div>
              <div>
      <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-600")}>Saved Internships</p>
      <p className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-green-800")}>{savedInternships.length}</p>
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
                        placeholder="Search internships, companies, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-emerald-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}
                      />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setShowFilters(!showFilters)}
                      variant={showFilters ? "default" : "outline"}
                      className={cn("h-12 gap-2 rounded-xl transition-all duration-300 hover:shadow-md", showFilters ? "bg-gradient-to-r from-emerald-600 to-green-600" : "")}
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
                          <SelectTrigger className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-emerald-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                          <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                            <SelectItem value="all-locations" className={darkMode ? "hover:bg-gray-700" : ""}>All Locations</SelectItem>
                            <SelectItem value="remote" className={darkMode ? "hover:bg-gray-700" : ""}>Remote</SelectItem>
                      {Array.from(new Set(internships.map(i => i.location))).map(loc => (
                        <SelectItem key={loc || 'unknown-location'} value={loc ? loc.toLowerCase() : 'unknown-location'}>{loc || 'Unknown'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Term Filter */}
                <div>
                        <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                    <Calendar className="h-4 w-4" />
                    Term
                  </label>
                  <Select value={termFilter} onValueChange={setTermFilter}>
                          <SelectTrigger className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-emerald-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                          <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                            <SelectItem value="all-terms" className={darkMode ? "hover:bg-gray-700" : ""}>All Terms</SelectItem>
                      {Array.from(new Set(internships.map(i => i.type))).map(type => (
                        <SelectItem key={type || 'unknown-type'} value={type ? type.toLowerCase() : 'unknown-type'}>{type || 'Unknown'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Salary Range Filter */}
                <div>
                        <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                    <DollarSign className="h-4 w-4" />
                          Min Stipend: ${salaryRange[0].toLocaleString()}
                  </label>
                        <Slider
                          value={salaryRange}
                          onValueChange={setSalaryRange}
                          max={20000}
                          min={0}
                          step={500}
                          className={cn("w-full transition-all duration-300", darkMode ? "[&_.slider-thumb]:bg-white [&_.slider-range]:bg-emerald-500" : "")}
                        />
                </div>
                {/* Experience Level Filter */}
                <div>
                        <label className={cn("text-sm font-medium mb-2 flex items-center gap-2", darkMode ? "text-gray-300" : "text-gray-700")}>
                    <Target className="h-4 w-4" />
                    Experience Level
                  </label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                          <SelectTrigger className={cn("h-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-emerald-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                          <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                            <SelectItem value="all-levels" className={darkMode ? "hover:bg-gray-700" : ""}>All Levels</SelectItem>
                      {Array.from(new Set(internships.map(i => i.experienceLevel))).map(level => (
                        <SelectItem key={level || 'unknown-level'} value={level ? level : 'unknown-level'}>{level || 'Unknown'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                    </div>
                    {/* Advanced Filters */}
                    <div className="mt-6">
                      <Tabs defaultValue="industry" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-xs">
                          <TabsTrigger value="industry">Industry</TabsTrigger>
                          <TabsTrigger value="benefits">Benefits</TabsTrigger>
                        </TabsList>
                        <TabsContent value="industry">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                            {industries.map((industry) => (
                              <Button
                                key={industry.value}
                                variant={industryFilter.includes(industry.value) ? 'default' : 'outline'}
                                className={cn(
                                  `h-auto py-2 flex-col gap-2 rounded-lg transition-all duration-300 hover:shadow-md`,
                                  industryFilter.includes(industry.value) ? 'bg-emerald-600 text-white' : ''
                                )}
                                onClick={() => {
                                  if (industryFilter.includes(industry.value)) {
                                    setIndustryFilter(industryFilter.filter(item => item !== industry.value));
                                  } else {
                                    setIndustryFilter([...industryFilter, industry.value]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {industry.icon}
                                  {industry.label}
                                </div>
                                {industryFilter.includes(industry.value) && (
                                  <span className="text-xs mt-1">Selected</span>
                                )}
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                        <TabsContent value="benefits">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                            {benefits.map((benefit) => (
                              <Button
                                key={benefit.value}
                                variant={benefitsFilter.includes(benefit.value) ? 'default' : 'outline'}
                                className={cn(
                                  `h-auto py-2 flex-col gap-2 rounded-lg transition-all duration-300 hover:shadow-md`,
                                  benefitsFilter.includes(benefit.value) ? 'bg-green-600 text-white' : ''
                                )}
                                onClick={() => {
                                  if (benefitsFilter.includes(benefit.value)) {
                                    setBenefitsFilter(benefitsFilter.filter(item => item !== benefit.value));
                                  } else {
                                    setBenefitsFilter([...benefitsFilter, benefit.value]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  {benefit.icon}
                                  {benefit.label}
                                </div>
                                {benefitsFilter.includes(benefit.value) && (
                                  <span className="text-xs mt-1">Selected</span>
                                )}
                              </Button>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    {/* Filter Actions */}
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                      <div className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
                        {industryFilter.length > 0 || benefitsFilter.length > 0 ? (
                          <span>
                            {industryFilter.length} industries, {benefitsFilter.length} benefits selected
                          </span>
                        ) : (
                          <span>No advanced filters selected</span>
                        )}
                </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setLocationFilter('all-locations');
                            setTermFilter('all-terms');
                            setSalaryRange([0]);
                            setExperienceLevel('all-levels');
                            setCompanyType('all-types');
                            setIndustryFilter([]);
                            setBenefitsFilter([]);
                          }}
                          className={cn("transition-all duration-300 hover:shadow-md", darkMode ? "text-gray-300 hover:bg-gray-700" : "")}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reset All
                        </Button>
                        <Button 
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 transition-all duration-300 hover:shadow-md"
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

          {/* Internship Listings Section */}
              <div>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className={cn("transition-all duration-300", darkMode ? "bg-gray-700" : "")}>
                    <TabsTrigger value="all" className={cn("transition-colors duration-300", darkMode ? "data-[state=active]:bg-gray-600" : "")}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        All Internships
                        <Badge variant="secondary" className="ml-1">
                          {filteredInternships.length}
                        </Badge>
                  </div>
                    </TabsTrigger>
                    <TabsTrigger value="saved" className={cn("transition-colors duration-300", darkMode ? "data-[state=active]:bg-gray-600" : "")}>
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Saved Internships
                        <Badge variant="secondary" className="ml-1">
                          {savedInternships.length}
                        </Badge>
                  </div>
                    </TabsTrigger>
                    <TabsTrigger value="applied" className={cn("transition-colors duration-300", darkMode ? "data-[state=active]:bg-gray-600" : "")}>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Applied
                        <Badge variant="secondary" className="ml-1">
                          {appliedInternships.length}
                        </Badge>
                  </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
                  Showing {currentInternships.length} of {internships.length} internships
                </div>
                <Select>
                  <SelectTrigger className={cn("w-48 h-10 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-emerald-500", darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-200")}>
                    <SelectValue placeholder="Sort by: Recommended" />
                  </SelectTrigger>
                  <SelectContent className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
                    <SelectItem value="newest" className={darkMode ? "hover:bg-gray-700" : ""}>Newest First</SelectItem>
                    <SelectItem value="stipend-high" className={darkMode ? "hover:bg-gray-700" : ""}>Stipend: High to Low</SelectItem>
                    <SelectItem value="company" className={darkMode ? "hover:bg-gray-700" : ""}>Company Name</SelectItem>
                    <SelectItem value="deadline" className={darkMode ? "hover:bg-gray-700" : ""}>Application Deadline</SelectItem>
                    <SelectItem value="popular" className={darkMode ? "hover:bg-gray-700" : ""}>Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Analytics Toggle (not for applied tab) */}
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
                    <h3 className={cn("text-lg font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>Salary Comparison</h3>
                    <p className={cn("text-sm text-gray-600 mb-4", darkMode ? "text-gray-400" : "text-gray-600")}>Compare average stipends across different industries and experience levels.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 transition-all duration-300 hover:shadow-md">
                        <Code className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Technology</p>
                          <p className="text-lg font-bold text-blue-800">$2,000/mo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 transition-all duration-300 hover:shadow-md">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Finance</p>
                          <p className="text-lg font-bold text-purple-800">$1,800/mo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 transition-all duration-300 hover:shadow-md">
                        <HardHat className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Healthcare</p>
                          <p className="text-lg font-bold text-green-800">$1,500/mo</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 transition-all duration-300 hover:shadow-md">
                        <Users className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Education</p>
                          <p className="text-lg font-bold text-red-800">$1,200/mo</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Skills Analysis Chart */}
            {showSkillsAnalysis && activeTab !== 'applied' && (
              <div className="mb-8">
                <Card className={cn("border-0 shadow-md transition-all duration-300 hover:shadow-lg", darkMode ? "bg-gray-800" : "bg-white/90")}> 
                  <CardContent className="p-4">
                    <h3 className={cn("text-lg font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>Skills Analysis</h3>
                    <p className={cn("text-sm text-gray-600 mb-4", darkMode ? "text-gray-400" : "text-gray-600")}>Visualize your skills against common internship requirements.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 transition-all duration-300 hover:shadow-md">
                        <Code className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Frontend</p>
                          <p className="text-lg font-bold text-yellow-800">80%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 transition-all duration-300 hover:shadow-md">
                        <Database className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Backend</p>
                          <p className="text-lg font-bold text-blue-800">70%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-200 transition-all duration-300 hover:shadow-md">
                        <Cpu className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">DevOps</p>
                          <p className="text-lg font-bold text-purple-800">60%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 transition-all duration-300 hover:shadow-md">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Mobile</p>
                          <p className="text-lg font-bold text-green-800">50%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Internship Listings */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentInternships.map((internship) => (
                  <JobCard
                    key={internship._id}
                    job={{
                      id: internship._id,
                      title: internship.title,
                      company: internship.company,
                      location: internship.location,
                      type: internship.type || 'Internship',
                      salary: internship.stipend || internship.salary || 'Competitive',
                      postedDate: internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : '',
                      description: internship.description,
                      logo: internship.logo,
                      isRemote: internship.remote,
                      isUrgent: internship.isUrgent,
                      skills: Array.isArray(internship.skills) ? internship.skills : typeof internship.skills === 'string' ? internship.skills.split(',').map(s => s.trim()) : [],
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentInternships.map((internship) => (
                  <Card 
                    key={internship._id} 
                    className={cn(
                      "transition-all duration-300 group shadow-md hover:shadow-xl",
                      darkMode ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "hover:border-emerald-300"
                    )}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-shrink-0 relative">
                            <img
                              src={internship.logo || '/placeholder.svg'}
                              alt={`${internship.company} logo`}
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
                                darkMode ? "group-hover:text-emerald-400" : "group-hover:text-emerald-600"
                              )}>
                                {internship.title}
                              </h3>
                              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>{internship.company}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={darkMode ? "bg-emerald-900 text-emerald-200" : "bg-emerald-100 text-emerald-800"}
                              >
                                {internship.type || 'Internship'}
                              </Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => toggleSavedInternship(internship._id)}
                                className="rounded-full transition-all duration-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                              >
                                <Heart 
                                        className={cn(
                                          "h-5 w-5 transition-colors duration-300",
                                          savedInternships.includes(internship._id) ? "fill-red-500 text-red-500" :
                                            darkMode ? "text-gray-400" : "text-gray-400"
                                        )}
                                />
                              </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {savedInternships.includes(internship._id) ? 'Remove from saved' : 'Save this internship'}
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => shareInternship(internship)}
                                      className="rounded-full transition-all duration-300 hover:bg-gray-200/50 dark:hover:bg-gray-700"
                                    >
                                      <Share2 className={cn("h-5 w-5", darkMode ? "text-gray-400" : "text-gray-400")} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Share this internship
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge variant="outline" className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "border-gray-700 bg-gray-700" : "")}>
                              <MapPin className="h-3 w-3" />
                              {internship.location}
                            </Badge>
                            <Badge variant="outline" className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "border-gray-700 bg-gray-700" : "")}>
                              <DollarSign className="h-3 w-3" />
                              {internship.stipend || internship.salary || 'Competitive'}
                          </Badge>
                            {internship.remote && (
                              <Badge variant="outline" className={cn("transition-colors duration-300", darkMode ? "bg-blue-900/30 text-blue-400 border-blue-800" : "bg-blue-50 text-blue-700")}>
                                <Globe className="h-3 w-3" />
                                Remote
                              </Badge>
                            )}
                            {internship.isUrgent && (
                              <Badge variant="outline" className={cn("transition-colors duration-300", darkMode ? "bg-red-900/30 text-red-400 border-red-800" : "bg-red-50 text-red-700")}>
                                <Zap className="h-3 w-3" />
                                Urgent
                              </Badge>
                            )}
                            {internship.experienceLevel && (
                              <Badge variant="outline" className={cn("transition-colors duration-300", darkMode ? "bg-purple-900/30 text-purple-400 border-purple-800" : "bg-purple-50 text-purple-700")}>
                                <Award className="h-3 w-3" />
                                {internship.experienceLevel}
                              </Badge>
                            )}
                          </div>
                          <p className={cn("mb-4 line-clamp-2 transition-colors duration-300", darkMode ? "text-gray-300" : "text-gray-600")}>
                        {internship.description}
                      </p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-sm">
                              <span className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "text-gray-400" : "text-gray-500")}>
                                <Clock className="h-4 w-4" />
                            Posted {internship.createdAt ? new Date(internship.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                              <span className={cn("flex items-center gap-1 transition-colors duration-300", darkMode ? "text-gray-400" : "text-gray-500")}>
                                <Eye className="h-4 w-4" />
                            {internship.views || 0} views
                          </span>
                        </div>
                            <Button 
                              onClick={() => applyToInternship(internship._id)}
                              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg gap-2 transition-all duration-300 hover:shadow-md hover:scale-105"
                            >
                              Apply Now
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {/* No Results */}
            {currentInternships.length === 0 && (
              <Card className={cn("text-center py-16 shadow-md", darkMode ? "bg-gray-800 border-gray-700" : "bg-white/90")}>
                <CardContent>
                  <div className={cn("p-4 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-300", darkMode ? "bg-gray-700" : "bg-gray-100")}>
                    <BookOpen className={cn("h-8 w-8", darkMode ? "text-gray-400" : "text-gray-400")} />
                  </div>
                  <h3 className={cn("text-xl font-semibold mb-3", darkMode ? "text-white" : "text-gray-800")}>
                    {activeTab === 'saved' ? 'No saved internships yet' : 'No internships found'}
                  </h3>
                  <p className={cn("max-w-md mx-auto mb-6", darkMode ? "text-gray-400" : "text-gray-600")}>
                    {activeTab === 'saved' 
                      ? "You haven't saved any internships yet. When you find interesting opportunities, click the bookmark icon to save them."
                      : (searchTerm || locationFilter !== 'all-locations' || termFilter !== 'all-terms' 
                          ? "No internships match your current filters. Try adjusting your search criteria."
                          : "No internships are currently available. Check back later for new opportunities!")
                    }
                  </p>
                  {activeTab !== 'saved' && (
                    <div className="flex gap-3 justify-center">
                  <Button 
                        variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setLocationFilter('all-locations');
                      setTermFilter('all-terms');
                        setSalaryRange([0]);
                      setExperienceLevel('all-levels');
                      setCompanyType('all-types');
                          setIndustryFilter([]);
                          setBenefitsFilter([]);
                    }}
                        className={cn("gap-2 transition-all duration-300 hover:shadow-md hover:scale-105", darkMode ? "border-gray-600 hover:bg-gray-700" : "")}
                  >
                        <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                      <Button 
                        variant="default"
                        onClick={() => setActiveTab('all')}
                        className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 transition-all duration-300 hover:shadow-md hover:scale-105"
                      >
                        <BookOpen className="h-4 w-4" />
                        Browse All Internships
                      </Button>
                    </div>
                  )}
                  {activeTab === 'saved' && (
                    <Button
                      variant="default"
                      onClick={() => setActiveTab('all')}
                      className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 transition-all duration-300 hover:shadow-md hover:scale-105"
                    >
                      <BookOpen className="h-4 w-4" />
                      Browse Internships
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Pagination */}
            {currentInternships.length > 0 && totalPages > 1 && (
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
                              currentPage === pageNum ? "bg-gradient-to-r from-emerald-600 to-green-600" : ""
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

export default Internships;