import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Building, Clock, Briefcase, Filter, Target, TrendingUp, Globe, Star, ArrowRight, DollarSign, Eye, Calendar, Zap, Heart, Share2, ExternalLink, Grid, List, BookOpen, Sparkles } from 'lucide-react';
import { getAllJobs } from '@/data/jobsData';
import { Link } from 'react-router-dom';
import { JobCard } from '@/components/user/JobCard';

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [salaryRange, setSalaryRange] = useState([50000]);
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  // removed quick stats: appliedJobsCount/urgentJobsCount

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.log('Backend not available, using local data');
      // Use local job data as fallback
      const localJobs = getAllJobs();
      setJobs(localJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // removed backend "applied" fetch and urgent count used only for removed cards

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete job');
      // Remove the deleted job from the UI
      setJobs(jobs => jobs.filter(job => job._id !== id));
    } catch (err) {
      alert('Error deleting job: ' + err.message);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm ||
      (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || (job.type && job.type.toLowerCase() === typeFilter.toLowerCase());
    const matchesSalary = job.salary && parseInt(job.salary.replace(/[^\d]/g, '')) >= salaryRange[0];
    return matchesSearch && matchesLocation && matchesType && matchesSalary;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing opportunities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Jobs</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl transform rotate-12 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-cyan-200/40 to-pink-200/40 rounded-full blur-3xl transform -rotate-12 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find your next career move with our curated selection of top jobs
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="glass p-6 shadow-xl hover:shadow-2xl transition-all duration-300 sticky top-4 border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Smart Filters</h2>
                  <p className="text-sm text-gray-600">Find your perfect match</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Job title, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 bg-white/80 border-white/30 rounded-xl"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="h-12 bg-white/80 border-white/30 rounded-xl">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="san francisco">San Francisco, CA</SelectItem>
                      <SelectItem value="new york">New York, NY</SelectItem>
                      <SelectItem value="los angeles">Los Angeles, CA</SelectItem>
                      <SelectItem value="boston">Boston, MA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Type
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-12 bg-white/80 border-white/30 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full-Time</SelectItem>
                      <SelectItem value="part-time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Minimum Salary: ${salaryRange[0].toLocaleString()}
                  </label>
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    max={200000}
                    min={30000}
                    step={5000}
                    className="w-full"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <label className="text-sm font-medium mb-3 text-gray-700 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Experience Level
                  </label>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger className="h-12 bg-white/80 border-white/30 rounded-xl">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="lead">Lead/Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Job Listings */}
          <div className="lg:w-3/4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Briefcase className="h-5 w-5" />
                  </div>
              <div>
                <p className="text-gray-600 text-xl">
                  <span className="font-bold text-purple-600 text-2xl">{filteredJobs.length}</span> jobs found
                </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Updated in real-time
                </p>
                  </div>
                </div>
                {/* Quick Stats removed as requested */}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/80 rounded-xl p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg"
                  >
                    <List className="h-4 w-4" />
                  </Button>
              </div>
              <Select>
                <SelectTrigger className="w-56 h-12 bg-white/80 border-white/30 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                </SelectContent>
              </Select>
              </div>
            </div>

            {/* Job Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job, index) => (
                  <div key={job._id} className="group hover:scale-105 transition-transform duration-300">
                    <JobCard job={{
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
                      skills: job.skills,
                    }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <Card key={job._id} className="hover:shadow-2xl transition-all duration-500 hover-scale group bg-white/90 backdrop-blur-lg border-white/40 relative overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <img
                            src={job.logo || '/placeholder.svg'}
                            alt={`${job.company} logo`}
                            className="w-16 h-16 rounded-xl object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                          {job.featured && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                              <Star className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl group-hover:text-purple-600 transition-colors duration-300">
                              {job.title}
                            </CardTitle>
                            {job.isNew && <Badge variant="secondary" className="bg-green-100 text-green-700">New</Badge>}
                            {job.isHot && <Badge className="bg-red-500 hover:bg-red-600">Hot</Badge>}
                          </div>
                          <CardDescription className="text-gray-600 flex flex-wrap items-center gap-3 text-sm mb-3">
                            <span className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
                              <Building className="h-3 w-3 text-purple-500" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                              <MapPin className="h-3 w-3 text-blue-500" />
                              {job.location}
                            </span>
                              <span className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                                <DollarSign className="h-3 w-3 text-green-500" />
                                {job.salary}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {job.type}
                          </Badge>
                          <div className="flex gap-1 mt-1">
                            {job.isRemote && (
                              <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                                <Globe className="h-3 w-3" />Remote
                              </Badge>
                    )}
                            {job.isUrgent && (
                              <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                                <Zap className="h-3 w-3" />Urgent
                              </Badge>
                            )}
                      </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                          </span>
                          <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                            {job.views || 0} views
                          </span>
                        </div>
                      <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg">
                          <Heart className="h-4 w-4" />
                        </Button>
                          <Link to={`/user/apply/${job._id}`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg">
                              Apply Now
                              <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                          </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}

            {/* No Results */}
            {filteredJobs.length === 0 && (
              <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
                <CardContent>
                  <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setLocationFilter('all');
                      setTypeFilter('all');
                      setExperienceFilter('all');
                      setSalaryRange([50000]);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
