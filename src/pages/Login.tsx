import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthContext } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowRight, LogIn, ChevronRight, Sparkles, Shield, Zap, Star, Trophy, Globe } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, userType, userData, logout } = useAuthContext();
  const [userTypeSelection, setUserTypeSelection] = useState<'user' | 'company'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [registerData, setRegisterData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    agreeToTerms: false 
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activePanel, setActivePanel] = useState<'login' | 'register'>('login');

  // Background particles
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10
  }));

  useEffect(() => {
    const normalizedType = (userType || '').toLowerCase().trim();
    if (userData && normalizedType === 'user' && location.pathname !== '/user/home') {
      navigate('/user/home');
    } else if (userData && normalizedType === 'company' && location.pathname !== '/company/home') {
      navigate('/company/home');
    }
  }, [userType, userData, navigate, location.pathname]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email) {
      toast({ 
        title: 'Login Failed', 
        description: 'Please enter your email address.', 
        variant: 'destructive', 
        duration: 3000 
      });
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      const user = await login(loginData.email, loginData.password || 'demo123', userTypeSelection);
      if (user) {
        toast({ 
          title: 'Login Successful!', 
          description: 'Welcome back!', 
          duration: 1500 
        });
        if (user.role === 'user') {
          navigate('/user/home');
        } else if (user.role === 'company') {
          navigate('/company/home');
        }
      } else {
        toast({ 
          title: 'Login Failed', 
          description: 'Login failed. Please try again.', 
          variant: 'destructive', 
          duration: 3000 
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.firstName) {
      toast({ 
        title: 'Registration Failed', 
        description: 'Please fill in all required fields.', 
        variant: 'destructive', 
        duration: 3000 
      });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast({ 
        title: 'Registration Failed', 
        description: 'Passwords do not match. Please try again.', 
        variant: 'destructive', 
        duration: 3000 
      });
      return;
    }
    if (!registerData.agreeToTerms) {
      toast({ 
        title: 'Registration Failed', 
        description: 'Please agree to the Terms of Service and Privacy Policy.', 
        variant: 'destructive', 
        duration: 3000 
      });
      return;
    }
    setIsLoading(true);
    setTimeout(async () => {
      const success = await register(registerData, userTypeSelection);
      if (!success) {
        toast({ 
          title: 'Registration Failed', 
          description: 'Registration failed. Please try again.', 
          variant: 'destructive', 
          duration: 3000 
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    toast({ 
      title: 'Google Login', 
      description: 'Google login is not implemented in this demo.', 
      duration: 2000 
    });
  };

  const runAutomatedLoginTest = useCallback(async () => {
    const testCases = [
      { email: 'testuser@demo.com', password: 'demo123', role: 'user' },
      { email: 'testcompany@demo.com', password: 'demo123', role: 'company' },
    ];
    let allPassed = true;
    for (const test of testCases) {
      const user = await login(test.email, test.password, test.role);
      if (user) {
        toast({
          title: `Automated Login Success (${test.role})`,
          description: `Logged in as ${user.email}`,
          duration: 2000,
        });
      } else {
        allPassed = false;
        toast({
          title: `Automated Login Failed (${test.role})`,
          description: `Could not login as ${test.email}`,
          variant: 'destructive',
          duration: 3000,
        });
      }
      if (logout) {
        logout();
      }
    }
    if (allPassed) {
      toast({
        title: 'All Automated Login Tests Passed!',
        duration: 2500,
      });
    }
  }, [login, logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden relative">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl transform rotate-12 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-cyan-400/30 to-pink-400/30 rounded-full blur-3xl transform -rotate-12 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`
          }}
        />
      ))}

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md md:max-w-7xl mx-4 my-8">
        <Card className="overflow-hidden shadow-2xl border-0 bg-white/70 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left side - Enhanced Branding */}
            <div className="hidden lg:flex w-full lg:w-1/2 p-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white flex-col justify-between relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 border border-white/30 rounded-full"></div>
                <div className="absolute top-32 right-16 w-16 h-16 border border-white/20 rounded-lg rotate-45"></div>
                <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/20 rounded-full"></div>
                <div className="absolute bottom-32 right-32 w-8 h-8 bg-white/30 rounded-full"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold">SmartHire</span>
                    <p className="text-white/80 text-sm">AI-Powered Recruitment</p>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  {activePanel === 'login' ? 'Welcome Back!' : 'Join SmartHire'}
                </h1>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  {activePanel === 'login' 
                    ? 'Sign in to access your account and continue your journey with smart recruitment solutions.'
                    : 'Create an account to revolutionize your hiring process with AI-powered tools.'}
                </p>
                
                {/* Feature highlights */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/90">Secure & Trusted Platform</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/90">AI-Powered Matching</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white/90">Global Opportunities</span>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-white/20 to-white/10 flex items-center justify-center">
                    {userTypeSelection === 'user' ? <User className="h-7 w-7 text-white" /> : <Building2 className="h-7 w-7 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">For {userTypeSelection === 'user' ? 'Job Seekers' : 'Companies'}</h3>
                    <p className="text-sm text-white/80">
                      {userTypeSelection === 'user' 
                        ? 'Discover your dream career with our intelligent job matching system'
                        : 'Find exceptional talent with our comprehensive recruitment platform'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Enhanced Form */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 bg-white">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SmartHire</span>
              </div>

              {/* User type selection */}
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant={userTypeSelection === 'user' ? 'default' : 'outline'}
                  onClick={() => setUserTypeSelection('user')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    userTypeSelection === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <User className="w-5 h-5" /> Job Seeker
                </Button>
                <Button
                  variant={userTypeSelection === 'company' ? 'default' : 'outline'}
                  onClick={() => setUserTypeSelection('company')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    userTypeSelection === 'company' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <Building2 className="w-5 h-5" /> Employer
                </Button>
              </div>

              {/* Enhanced Tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => setActivePanel('login')}
                  className={`flex-1 py-3 px-4 font-semibold text-center rounded-lg transition-all duration-300 ${
                    activePanel === 'login' 
                      ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActivePanel('register')}
                  className={`flex-1 py-3 px-4 font-semibold text-center rounded-lg transition-all duration-300 ${
                    activePanel === 'register' 
                      ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

            {activePanel === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                <div className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-12 h-14 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-12 pr-12 h-14 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="remember"
                        checked={loginData.rememberMe}
                        onCheckedChange={(checked) => setLoginData(prev => ({ ...prev, rememberMe: checked as boolean }))}
                        className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Remember me for 30 days
                      </label>
                    </div>
                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Signing you in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Sign In</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-14 rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-300 hover:shadow-md"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 mr-3" />
                  Continue with Google
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActivePanel('register')}
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Create one now
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">First Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        type="text"
                        placeholder="Enter first name"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Last Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        type="text"
                        placeholder="Enter last name"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-12 pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-12 pr-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base placeholder:text-gray-400"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <Checkbox
                    id="terms"
                    checked={registerData.agreeToTerms}
                    onCheckedChange={(checked) => setRegisterData(prev => ({ ...prev, agreeToTerms: checked as boolean }))}
                    className="mt-0.5 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to SmartHire's{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500 font-semibold underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500 font-semibold underline">
                      Privacy Policy
                    </a>
                    . I understand that my data will be used to provide personalized job recommendations.
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Creating your account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Create Account</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActivePanel('login')}
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}
            </div>
          </div>
        </Card>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Award Winning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating action button for demo */}
      <Button
        onClick={runAutomatedLoginTest}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-full w-14 h-14 p-0 flex items-center justify-center text-white transition-all duration-300 hover:shadow-xl transform hover:scale-110"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 016.775-5.025.75.75 0 01.313 1.248l-3.32 3.319c.063.475.276.934.641 1.299.365.365.824.578 1.3.64l3.318-3.319a.75.75 0 011.248.313 5.25 5.25 0 01-5.472 6.756c-1.018-.086-1.87.1-2.309.634L7.344 21.3A3.298 3.298 0 112.7 16.657l8.684-7.151c.533-.44.72-1.291.634-2.309A5.342 5.342 0 0112 6.75zM4.117 19.125a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" clipRule="evenodd" />
        </svg>
      </Button>

      {/* Enhanced Global styles */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg); 
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(90deg); 
          }
          50% { 
            transform: translateY(0) translateX(20px) rotate(180deg); 
          }
          75% { 
            transform: translateY(20px) translateX(10px) rotate(270deg); 
          }
        }
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        /* Enhanced focus styles */
        .group:focus-within .group-focus-within\\:text-blue-600 {
          color: rgb(37 99 235);
        }
        
        /* Custom scrollbar for better aesthetics */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default Login;