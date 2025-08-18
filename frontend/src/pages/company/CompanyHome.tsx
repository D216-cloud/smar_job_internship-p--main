import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Briefcase, Users, TrendingUp, Star, Sparkles, Zap, Award, Target, MessageSquare, Eye, MapPin, DollarSign, BookOpen } from 'lucide-react';

export const CompanyHome = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { icon: Briefcase, label: "Active Jobs", value: "1200+", color: "from-blue-500 to-cyan-500" },
    { icon: Users, label: "Companies", value: "50+", color: "from-purple-500 to-pink-500" },
    { icon: TrendingUp, label: "Success Rate", value: "95%", color: "from-green-500 to-emerald-500" },
    { icon: Star, label: "Employer Rating", value: "4.9/5", color: "from-orange-500 to-yellow-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] py-20 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-br from-blue-300/15 to-cyan-300/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-20 w-96 h-96 bg-gradient-to-br from-purple-300/15 to-pink-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-orange-300/15 to-yellow-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-blue-100 mb-7 shadow-lg hover:shadow-xl transition-all duration-300 animate-in slide-in-from-top duration-700">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Welcome to Your Company Portal</span>
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg transition-shadow">
                Company
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl font-light text-gray-600 mb-4 animate-in slide-in-from-top duration-700 delay-150">
              Find Top Talent Effortlessly
            </h1>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight animate-in slide-in-from-top duration-700 delay-300">
              Grow Your Team
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                With SmartHire
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-top duration-700 delay-400">
              Post jobs, review applications, and hire the best candidates — all in one intelligent platform.
            </p>

            {/* Search Interface */}
            <div className="max-w-4xl mx-auto mb-12 animate-in slide-in-from-bottom duration-700 delay-500">
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-4 md:p-7 border border-white/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
                <div className="flex flex-col gap-5">
                  <div className="relative">
                    <Search className="absolute left-5 md:left-7 top-1/2 transform -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                    <Input 
                      placeholder="Search jobs, candidates, or skills..." 
                      className="pl-14 md:pl-18 pr-4 md:pr-36 h-14 md:h-18 border-0 bg-gray-50/70 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-base md:text-lg rounded-2xl shadow-inner"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2">
                      <Link to="/company/applications">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-4 md:px-10 h-10 md:h-12 text-sm md:text-base font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          <span className="hidden md:inline">Search</span>
                          <Search className="h-4 w-4 md:hidden" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Quick Filters */}
                  <div className="flex flex-wrap justify-center gap-3">
                    {['Remote Talent', 'Full-Time', 'Tech Roles', 'High Salary'].map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="px-4 py-1.5 text-sm hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-all duration-200 border-gray-200 hover:border-blue-200 shadow-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14 animate-in slide-in-from-bottom duration-700 delay-600">
              <Link to="/company/applications">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-12 py-6 group shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl w-full sm:w-auto min-w-48"
                >
                  <Briefcase className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Manage Jobs
                  <Sparkles className="ml-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Button>
              </Link>
              <Link to="/company/post-job">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white px-12 py-6 group shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl w-full sm:w-auto min-w-48"
                >
                  <BookOpen className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Post a Job
                  <Sparkles className="ml-3 h-5 w-5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </Button>
              </Link>
            </div>

            <div className="flex justify-center mb-14 animate-in slide-in-from-bottom duration-700 delay-700">
              <Link to="/company/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-12 py-6 bg-white/80 backdrop-blur-md border border-gray-200 hover:bg-white hover:border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-gray-700 font-medium"
                >
                  <Target className="mr-3 h-5 w-5" />
                  Company Dashboard
                </Button>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom duration-700 delay-800">
              {[
                { icon: Target, title: "Smart Matches", desc: "AI matches jobs to top candidates", color: "from-blue-500 to-cyan-500" },
                { icon: Zap, title: "One-Click Post", desc: "Publish jobs in seconds", color: "from-purple-500 to-pink-500" },
                { icon: MessageSquare, title: "Real-Time Alerts", desc: "Get notified of new applicants", color: "from-green-500 to-emerald-500" },
                { icon: Award, title: "Hiring Progress", desc: "Track your team growth journey", color: "from-orange-500 to-yellow-500" }
              ].map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-white/80 backdrop-blur-lg border border-gray-100 hover:border-blue-200/60 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 group cursor-pointer"
                >
                  <CardHeader className="text-center pb-2">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-800">{feature.title}</CardTitle>
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Companies Love SmartHire</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Trusted by 50+ companies for faster, smarter hiring.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-7 shadow-sm hover:shadow-lg transition-all duration-300 group hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyHome;