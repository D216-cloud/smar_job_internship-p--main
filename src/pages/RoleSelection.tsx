import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  Building2, 
  Search, 
  Upload, 
  Target, 
  Zap, 
  Star, 
  Sparkles, 
  ArrowRight,
  User,
  Building,
  ChevronRight,
  Check
} from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'user' | 'company' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRoleSelect = (role: 'user' | 'company') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedRole(role);
    
    setTimeout(() => {
      navigate('/login', { state: { role } });
    }, 800);
  };

  const userFeatures = [
    { icon: Search, title: "Find Your Dream Job", desc: "Browse thousands of opportunities" },
    { icon: Target, title: "AI-Powered Matching", desc: "Get personalized job recommendations" },
    { icon: Zap, title: "Quick Apply", desc: "Apply to jobs with one click" },
    { icon: Star, title: "Track Applications", desc: "Monitor your application progress" }
  ];

  const companyFeatures = [
    { icon: Upload, title: "Post Jobs Instantly", desc: "Reach qualified candidates fast" },
    { icon: Users, title: "AI Candidate Screening", desc: "Automated candidate matching" },
    { icon: Building2, title: "Employer Branding", desc: "Showcase your company culture" },
    { icon: Sparkles, title: "Analytics Dashboard", desc: "Track hiring performance" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 right-20 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }}></div>
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Header section */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 md:px-6 py-3 rounded-full border border-blue-100 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-gray-700">Welcome to SmartHire</span>
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm hover:shadow-md transition-shadow">
              Choose Your Experience
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight tracking-tight">
            How would you like to
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
              use SmartHire?
            </span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Select your role below to access the perfect hiring or job seeking experience
          </p>
        </div>

        {/* Role selection cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-20">
          {/* Job Seeker Card */}
          <div 
            className={`relative transition-all duration-500 ease-&lsqb;cubic-bezier(0.34,1.56,0.64,1)&rsqb;&rsqb; ${
              selectedRole === 'company' ? 'opacity-70 scale-95' : ''
            } ${selectedRole === 'user' ? 'scale-100' : ''}`}
            onClick={() => handleRoleSelect('user')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl transition-all duration-500 ${
              selectedRole === 'user' ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            <Card className={`relative overflow-hidden h-full border-2 transition-all duration-300 ${
              selectedRole === 'user' 
                ? 'border-blue-500 shadow-xl scale-[1.02]' 
                : 'border-transparent hover:border-blue-300 hover:shadow-lg'
            } bg-white/90 backdrop-blur-sm`}>
              <CardHeader className="text-center pb-4 md:pb-6">
                <div className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 shadow-lg ${
                  selectedRole === 'user' ? 'scale-110 rotate-2 shadow-xl' : 'group-hover:scale-105'
                }`}>
                  <User className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Job Seeker</CardTitle>
                <CardDescription className="text-base md:text-lg text-gray-600">
                  Find and apply to your dream job with AI-powered matching
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-3">
                  {userFeatures.map((feature, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 ${
                        selectedRole === 'user' 
                          ? 'bg-blue-50/80 border border-blue-200 shadow-sm' 
                          : 'bg-white hover:bg-blue-50/50 border border-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedRole === 'user' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 md:text-base">{feature.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full py-4 md:py-6 text-base md:text-lg font-semibold transition-all duration-300 ${
                    selectedRole === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg animate-pulse' 
                      : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md'
                  }`}
                  disabled={selectedRole === 'company'}
                >
                  {selectedRole === 'user' ? (
                    <div className="flex items-center justify-center gap-3">
                      <span>Redirecting to Job Seeker Portal</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Continue as Job Seeker</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Company Card */}
          <div 
            className={`relative transition-all duration-500 ease-&lsqb;cubic-bezier(0.34,1.56,0.64,1)&rsqb;&rsqb; ${
              selectedRole === 'user' ? 'opacity-70 scale-95' : ''
            } ${selectedRole === 'company' ? 'scale-100' : ''}`}
            onClick={() => handleRoleSelect('company')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl transition-all duration-500 ${
              selectedRole === 'company' ? 'opacity-100' : 'opacity-0'
            }`}></div>
            
            <Card className={`relative overflow-hidden h-full border-2 transition-all duration-300 ${
              selectedRole === 'company' 
                ? 'border-purple-500 shadow-xl scale-[1.02]' 
                : 'border-transparent hover:border-purple-300 hover:shadow-lg'
            } bg-white/90 backdrop-blur-sm`}>
              <CardHeader className="text-center pb-4 md:pb-6">
                <div className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 shadow-lg ${
                  selectedRole === 'company' ? 'scale-110 rotate-2 shadow-xl' : 'group-hover:scale-105'
                }`}>
                  <Building className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Employer</CardTitle>
                <CardDescription className="text-base md:text-lg text-gray-600">
                  Find and hire top talent with our powerful recruitment tools
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-3">
                  {companyFeatures.map((feature, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 ${
                        selectedRole === 'company' 
                          ? 'bg-purple-50/80 border border-purple-200 shadow-sm' 
                          : 'bg-white hover:bg-purple-50/50 border border-gray-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedRole === 'company' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 md:text-base">{feature.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full py-4 md:py-6 text-base md:text-lg font-semibold transition-all duration-300 ${
                    selectedRole === 'company' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg animate-pulse' 
                      : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md'
                  }`}
                  disabled={selectedRole === 'user'}
                >
                  {selectedRole === 'company' ? (
                    <div className="flex items-center justify-center gap-3">
                      <span>Redirecting to Employer Portal</span>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Continue as Employer</span>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats section */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8">Why Companies & Candidates Choose SmartHire</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { icon: Briefcase, label: "Active Jobs", value: "1,200+", color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
                { icon: Users, label: "Job Seekers", value: "50,000+", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
                { icon: Building2, label: "Companies", value: "500+", color: "bg-gradient-to-br from-green-500 to-emerald-500" },
                { icon: Star, label: "Success Rate", value: "95%", color: "bg-gradient-to-br from-orange-500 to-yellow-500" }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 group"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-xs md:text-sm font-medium text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features comparison */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">SmartHire Benefits</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you're looking for a job or hiring talent, SmartHire delivers exceptional results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>For Job Seekers</span>
              </h3>
              <ul className="space-y-3">
                {[
                  "AI-powered job matching",
                  "One-click application process",
                  "Personalized career recommendations",
                  "Real-time application tracking",
                  "Skill development resources"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-purple-600" />
                <span>For Employers</span>
              </h3>
              <ul className="space-y-3">
                {[
                  "Advanced candidate screening",
                  "Automated job posting",
                  "Employer branding tools",
                  "Comprehensive analytics",
                  "Dedicated hiring support"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Select your role above to begin your journey with SmartHire
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/about">
              <Button 
                variant="outline" 
                className="px-6 py-3 border border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                Learn More About Us
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                variant="outline" 
                className="px-6 py-3 border border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-colors"
              >
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;