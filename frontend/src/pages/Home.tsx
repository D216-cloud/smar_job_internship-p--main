import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Briefcase, Users, TrendingUp, Star, Target, Award } from 'lucide-react';

  const stats = [
  { icon: Briefcase, label: "Active Job Posts", value: 1200, color: "from-blue-500 to-cyan-500" },
  { icon: Users, label: "Recruiters", value: 500, color: "from-purple-500 to-pink-500" },
  { icon: TrendingUp, label: "Successful Hires", value: 2300, color: "from-green-500 to-emerald-500" },
  { icon: Star, label: "Employer Rating", value: 4.9, color: "from-orange-500 to-yellow-500" }
  ];

  const featuredCompanies = [
    { name: "Google", logo: "🔍", url: "https://careers.google.com" },
    { name: "Microsoft", logo: "🪟", url: "https://careers.microsoft.com" },
    { name: "Apple", logo: "🍎", url: "https://jobs.apple.com" },
    { name: "Meta", logo: "📘", url: "https://careers.meta.com" },
    { name: "Amazon", logo: "📦", url: "https://amazon.jobs" },
    { name: "Netflix", logo: "🎬", url: "https://jobs.netflix.com" },
    { name: "Tesla", logo: "⚡", url: "https://tesla.com/careers" },
    { name: "Uber", logo: "🚗", url: "https://uber.com/careers" }
  ];

  const successStories = [
    {
      name: "Priya Singh",
      role: "Recruiter at TechNova Pvt. Ltd",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "Posting jobs on SmartHire helped us find top talent quickly and efficiently!"
    },
    {
      name: "James Lee",
      role: "HR Manager at CodeCraft",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "The platform's AI-matching made our hiring process seamless."
    },
    {
      name: "Anita Patel",
      role: "Talent Acquisition at Design Studio",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      quote: "We filled our urgent roles in record time thanks to Jobora's recruiter tools."
    }
  ];

export default function Home() {
  const navigate = useNavigate();

  // Animated stats
  const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);
  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setStatCounts(prev => prev.map((v, i) => {
        const target = stats[i].value;
        if (i === 3) return Math.min((prev[i] + 0.1), target);
        return Math.min(Math.floor(prev[i] + target / 30), target);
      }));
      if (frame > 30) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Testimonial carousel
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Parallax hero
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const y = window.scrollY;
      heroRef.current.style.backgroundPosition = `center ${y * 0.2}px`;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 overflow-hidden transition-all duration-700" style={{ backgroundPosition: 'center 0px' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-6 shadow-lg animate-fade-in">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">AI-Powered Hiring Platform</span>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">For Recruiters</Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight">
                Transform Your Hiring
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  With Jobora
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in">
                Experience the future of recruitment with our AI-driven platform that connects you with the best candidates for your open roles—quickly, efficiently, and at scale.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all duration-300 animate-bounce" onClick={() => navigate('/user/login')}>
                I'm a Job Seeker
                      </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-2xl shadow-xl transform hover:scale-110 transition-all duration-300 animate-bounce" onClick={() => navigate('/company/login')}>
                I'm a Company
                      </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center animate-fade-in">
            <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-8 w-8 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {i === 3 ? statCounts[i].toFixed(1) : statCounts[i]}{i === 3 ? '/5' : '+'}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
            ))}
          </div>

      {/* Testimonial carousel */}
      <div className="max-w-2xl mx-auto my-12">
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 text-center transition-all duration-500 animate-fade-in">
          <img src={successStories[testimonialIdx].avatar} alt={successStories[testimonialIdx].name} className="w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-lg text-gray-700 mb-2">"{successStories[testimonialIdx].quote}"</p>
          <div className="font-semibold text-blue-700">{successStories[testimonialIdx].name}</div>
          <div className="text-sm text-gray-500">{successStories[testimonialIdx].role}</div>
          </div>
        </div>

      {/* Featured companies */}
      <div className="flex flex-wrap justify-center gap-6 my-8">
        {featuredCompanies.map((company, idx) => (
          <a key={company.name} href={company.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center transition-transform duration-300 hover:scale-110">
            <span className="text-4xl mb-2 group-hover:animate-bounce">{company.logo}</span>
            <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors">{company.name}</span>
          </a>
            ))}
          </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto my-16">
        <h3 className="text-3xl font-bold text-center mb-8">How Jobora Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
            { icon: <Sparkles className="h-8 w-8 text-blue-500 mx-auto" />, title: 'Sign Up', desc: 'Create your free account and set up your profile.' },
            { icon: <Target className="h-8 w-8 text-green-500 mx-auto" />, title: 'Get Matched', desc: 'Receive personalized job recommendations instantly.' },
            { icon: <Award className="h-8 w-8 text-orange-500 mx-auto" />, title: 'Achieve Success', desc: 'Apply, interview, and land your dream job or hire top talent.' },
          ].map((step, idx) => (
            <div key={idx} className="bg-white/80 rounded-2xl shadow-lg p-6 text-center transition-all duration-300 hover:scale-105">
              {step.icon}
              <h4 className="text-xl font-semibold mt-4 mb-2">{step.title}</h4>
              <p className="text-gray-600">{step.desc}</p>
                  </div>
          ))}
        </div>
      </section>
    </div>
  );
}
