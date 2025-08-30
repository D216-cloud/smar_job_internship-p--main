import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronRight, User, Briefcase, Building2, BookOpen, Star, Zap, Sparkles, Globe, Settings, HelpCircle, Bookmark, TrendingUp, Award, MessageCircle } from 'lucide-react';
import logo from "../Images/logo.png";
import Header from "@/components/Header";

const TopNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: Briefcase, gradient: 'from-blue-500 to-cyan-500' },
    { name: 'About Us', path: '/about', icon: User, gradient: 'from-pink-500 to-rose-500' },
    { name: 'Contact', path: '/contact', icon: User, gradient: 'from-amber-500 to-orange-500' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleNavClick = (path: string) => {
    // Special handling for AI Chat - redirect to user dashboard if logged in
    if (path === '/chat') {
      const token = localStorage.getItem('token');
      if (token) {
        // User is logged in, redirect to user chat
        navigate('/user/chat');
        return;
      }
    }
    
    if (location.pathname === path) {
      const heroSection = document.querySelector('#hero') || document.querySelector('main');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(path);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg'
        : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'
      }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logo}
              alt="Logo"
              className="h-8 w-auto object-contain bg-transparent"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105 relative group ${location.pathname === item.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                  }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                )}
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Link>
            ))}

            {/* Enhanced Action Buttons */}
            <div className="flex items-center space-x-3 ml-4">
              {/* Language Selector */}
             

              {/* Login Button */}
              <Link to="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <User className="h-4 w-4 mr-2" />
                  Login / Register
                </Button>
              </Link>
            </div>
          </nav>

          {/* Enhanced Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md transition-all duration-300 hover:bg-accent hover:scale-110 relative"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative">
              {isMenuOpen ? (
                <X size={24} className="animate-spin" />
              ) : (
                <Menu size={24} className="group-hover:scale-110 transition-transform" />
              )}
            </div>
          </button>
        </div>

        {/* Enhanced Mobile Navigation Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-16 z-40 animate-fade-in">
            {/* Enhanced Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-md animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Enhanced Sliding Menu Panel with White Background */}
            <div className={`
              absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl 
              transform transition-all duration-500 ease-out border-l border-gray-200
              ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
              {/* Enhanced Menu Header */}
              <div className="p-6 bg-white border-b border-gray-200 relative overflow-hidden">
                {/* Floating particles */}
                <div className="absolute top-2 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
                <div className="absolute bottom-3 left-6 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '2s' }}></div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <img src="https://via.placeholder.com/150" alt="Logo" className="w-10 h-10 rounded-lg shadow-lg" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">SmartHire</h2>
                      <p className="text-xs text-gray-600">Your Career Partner</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-110 shadow-md"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Enhanced Menu Items */}
              <div className="p-4 space-y-2 max-h-[calc(100vh-350px)] overflow-y-auto bg-white">
                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.path)}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-xl text-left
                        transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md
                        group animate-fade-in relative overflow-hidden
                        ${location.pathname === item.path
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 text-blue-700 shadow-md'
                          : 'text-gray-700 hover:text-gray-900'
                        }
                      `}
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      {/* Background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="flex items-center space-x-4 relative z-10">
                        <div className={`
                          p-2.5 rounded-lg transition-all duration-300 shadow-sm
                          ${location.pathname === item.path
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-gray-200 group-hover:to-gray-300'
                          }
                        `}>
                          <IconComponent size={18} />
                        </div>
                        <div>
                          <span className="font-medium text-sm">{item.name}</span>
                          {location.pathname === item.path && (
                            <div className="text-xs text-blue-600 font-medium mt-0.5">Current Page</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 relative z-10">
                        {location.pathname === item.path && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        <ChevronRight
                          size={16}
                          className={`
                            transition-all duration-300 
                            ${location.pathname === item.path ? 'text-blue-600' : 'text-gray-600'}
                            group-hover:translate-x-1 group-hover:text-gray-600
                          `}
                        />
                      </div>
                    </button>
                  );
                })}

                {/* Additional Mobile Menu Items */}
                <div className="pt-4 border-t border-gray-100">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md group">
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300 shadow-sm">
                        <Bookmark size={18} />
                      </div>
                      <span className="font-medium text-sm text-gray-700">Saved Jobs</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-all duration-300" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md group">
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300 shadow-sm">
                        <HelpCircle size={18} />
                      </div>
                      <span className="font-medium text-sm text-gray-700">Help & Support</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                </div>
              </div>

              {/* Enhanced Menu Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
                <div className="space-y-4">
                  {/* Enhanced Quick Stats */}
                  <div className="flex items-center justify-around py-4 px-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 animate-pulse">500+</div>
                      <div className="text-xs text-gray-600">Jobs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600 animate-pulse" style={{ animationDelay: '0.5s' }}>200+</div>
                      <div className="text-xs text-gray-600">Companies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-600 animate-pulse" style={{ animationDelay: '1s' }}>50+</div>
                      <div className="text-xs text-gray-600">Internships</div>
                    </div>
                  </div>

                  {/* Enhanced Login Button */}
                  <button
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center space-x-3 relative overflow-hidden group"
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <User size={18} className="relative z-10" />
                    <span className="relative z-10">Login / Register</span>
                    <Sparkles size={16} className="relative z-10 animate-pulse" />
                  </button>

                  {/* New Feature Badge */}
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-xs text-green-700 font-medium border border-green-200">
                      <Star size={12} className="animate-pulse" />
                      <span>AI-Powered Matching</span>
                      <Zap size={12} className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
