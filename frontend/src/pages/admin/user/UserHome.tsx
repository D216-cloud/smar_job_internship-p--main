import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Briefcase, Users, TrendingUp, Star, Sparkles, Zap, Shield, Award, Target, MessageSquare, Eye, MapPin, DollarSign, BookOpen } from 'lucide-react';
import { getAllJobs, searchJobs, Job } from '@/data/jobsData';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const UserHome = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [showResults, setShowResults] = useState(false);

  const allJobs = getAllJobs();
  const featuredJobs = allJobs.slice(0, 3);

  useEffect(() => {
    if (!sessionStorage.getItem('welcome_shown')) {
      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
        duration: 2000,
      });
      sessionStorage.setItem('welcome_shown', 'true');
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    
    const results = searchJobs(query);
    setSearchResults(results);
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const stats = [
    { icon: Briefcase, label: "Active Jobs", value: allJobs.length.toString(), color: "from-blue-500 to-cyan-500" },
    { icon: Users, label: "Companies", value: "50+", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, label: "Success Rate", value: "95%", color: "from-green-500 to-emerald-500" },
    { icon: Star, label: "User Rating", value: "4.9/5", color: "from-orange-500 to-yellow-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] py-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/3 right-20 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main Hero Content */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-100 mb-6 shadow-md hover:shadow-lg transition-shadow duration-300 animate-fade-in">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Welcome to Your Career Portal</span>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:shadow-md transition-shadow">
                  User
                </Badge>
              </div>

              <h1 className="text-xl md:text-2xl font-light text-gray-600 mb-4 animate-fade-in">
                Discover Your Next Opportunity
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight tracking-tight" style={{ animationDelay: '0.2s' }}>
                Find Your Dream
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                  Career Today
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Browse through {allJobs.length} active job opportunities from top companies and start your journey towards professional success.
              </p>
            </div>

            {/* Search Interface */}
            <div className="max-w-4xl mx-auto mb-12 animate-fade-in relative" style={{ animationDelay: '0.4s' }}>
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-3 md:p-6 border border-white/40 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                    <Input 
                      placeholder="Search jobs, companies, skills..." 
                      className="pl-12 md:pl-16 pr-4 md:pr-32 h-12 md:h-16 border-0 bg-gray-50/80 backdrop-blur-sm focus:bg-white transition-all duration-300 text-base md:text-lg rounded-2xl shadow-inner"
                      value={searchQuery}
                      onChange={handleInputChange}
                    />
                    <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2">
                      <Link to="/user/jobs">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-3 md:px-8 h-8 md:h-10 text-sm md:text-base shadow-md hover:shadow-lg transition-all"
                        >
                          <span className="hidden md:inline">Search</span>
                          <Search className="h-4 w-4 md:hidden" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Badge variant="outline" className="hover:bg-blue-50 cursor-pointer transition-colors">
                      Remote Jobs
                    </Badge>
                    <Badge variant="outline" className="hover:bg-purple-50 cursor-pointer transition-colors">
                      Full-Time
                    </Badge>
                    <Badge variant="outline" className="hover:bg-green-50 cursor-pointer transition-colors">
                      Tech Jobs
                    </Badge>
                    <Badge variant="outline" className="hover:bg-orange-50 cursor-pointer transition-colors">
                      High Salary
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="mt-4 bg-white/95 backdrop-blur-lg rounded-2xl border border-gray-200 shadow-2xl max-h-96 overflow-auto animate-fade-in">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">Search Results ({searchResults.length})</h3>
                    <div className="space-y-3">
                      {searchResults.slice(0, 5).map((job) => (
                        <Link to={`/user/jobs`} key={job.id} className="block">
                          <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{job.title}</h4>
                                <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                              </div>
                              <Badge variant="outline">{job.type}</Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Link to="/user/jobs">
                        <Button variant="outline" className="w-full">
                          View All Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Link to="/user/jobs">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-10 py-4 group shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl w-full sm:w-auto"
                >
                  <Briefcase className="mr-3 h-6 w-6 group-hover:scale-110 transition-all duration-300" />
                  Browse Jobs
                  <Sparkles className="ml-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Button>
              </Link>
              <Link to="/user/internships">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white px-10 py-4 group shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl w-full sm:w-auto"
                >
                  <BookOpen className="mr-3 h-6 w-6 group-hover:scale-110 transition-all duration-300" />
                  Browse Internships
                  <Sparkles className="ml-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Button>
              </Link>
            </div>
            <div className="flex justify-center mb-12">
              <Link to="/user/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-10 py-4 bg-white/80 backdrop-blur-md border-white/40 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                >
                  <Target className="mr-3 h-5 w-5" />
                  My Dashboard
                </Button>
              </Link>
            </div>

            {/* Features Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              {[
                { icon: Target, title: "Personalized Jobs", desc: "Jobs matched to your profile", color: "from-blue-500 to-cyan-500" },
                { icon: Zap, title: "Quick Apply", desc: "Apply with one click", color: "from-purple-500 to-pink-500" },
                { icon: MessageSquare, title: "Real-time Updates", desc: "Get notified of new opportunities", color: "from-green-500 to-emerald-500" },
                { icon: Award, title: "Career Growth", desc: "Track your application progress", color: "from-orange-500 to-yellow-500" }
              ].map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-white/80 backdrop-blur-lg border-white/40 hover:border-blue-300/50 transition-all duration-500 hover-scale group shadow-lg hover:shadow-2xl transform hover:-translate-y-2"
                >
                  <CardHeader className="text-center pb-2">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Career Portal Stats</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real opportunities. Real progress.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in hover-scale group" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Handpicked jobs just for you</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {featuredJobs.map((job) => (
              <Card 
                key={job.id} 
                className="hover:shadow-xl transition-all duration-300 hover-scale group bg-white border border-gray-100 shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    {job.logo && (
                      <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{job.title}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">{job.company}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">{job.salary}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                    <div className="flex items-center justify-between pt-4">
                      <Badge variant="outline">{job.type}</Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Eye className="h-3 w-3" />
                        {job.views} views
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/user/jobs">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
              >
                View All Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};