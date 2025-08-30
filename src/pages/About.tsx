import { useState, useEffect, useMemo } from 'react';
import {
  Users as UsersIcon,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Smile,
  ThumbsUp,
  Globe,
  UserCheck,
  Star as StarIcon,
  MessageCircle as MessageIcon,
  Building2,
  X,
  Heart,
  Lightbulb,
  Trophy,
  Shield,
  Linkedin,
  Github,
  Twitter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import deepakImage from '@/Images/Deepak Maheta.jpg';
import jainamImage from '@/Images/Jainam Patel.jpg';
import sachinImage from '@/Images/Sachin Chauhan.jpg';
import React from 'react';

  const team = [
    {
      id: 1,
    name: 'Deepak Maheta',
    role: 'Founder & Full Stack Developer',
    subRole: 'Tech Lead & AI Integrator',
      image: deepakImage,
    linkedin: 'https://linkedin.com/in/deepakmaheta',
    github: 'https://github.com/deepakmaheta',
    twitter: 'https://twitter.com/deepakmaheta',
    skills: ['React', 'Node.js', 'AI/ML', 'System Architecture'],
    achievements: ['10+ Years Experience', 'AI Expert', 'Startup Founder']
    },
    {
      id: 2,
    name: 'Jainam Patel',
    role: 'Co-Founder & Senior UI/UX Designer',
    subRole: 'Design Systems Architect',
      image: jainamImage,
    linkedin: 'https://linkedin.com/in/jainampatel',
    github: 'https://github.com/jainampatel',
    twitter: 'https://twitter.com/jainampatel',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    achievements: ['Design Award Winner', 'UX Specialist', 'Creative Director']
    },
    {
      id: 3,
    name: 'Sachin Chauhan',
    role: 'Senior Backend Developer',
    subRole: 'API Integration Specialist',
      image: sachinImage,
    linkedin: 'https://linkedin.com/in/sachinchauhan',
    github: 'https://github.com/sachinchauhan',
    twitter: 'https://twitter.com/sachinchauhan',
    skills: ['Python', 'APIs', 'Database Design', 'Cloud Architecture'],
    achievements: ['Backend Expert', 'Cloud Architect', 'Performance Guru']
    }
  ];

const testimonials = [
  {
    quote: 'SmartHire helped me land my dream job in just 2 weeks! The AI recommendations were spot on.',
    name: 'Amit S.',
    title: 'Software Engineer, India',
    avatar: '🧑‍💻',
    icon: StarIcon,
    color: 'text-yellow-400'
  },
  {
    quote: 'We found amazing talent for our startup through SmartHire. The process was seamless and fast.',
    name: 'Priya K.',
    title: 'HR Manager, Singapore',
    avatar: '👩‍💼',
    icon: MessageIcon,
    color: 'text-blue-400'
  },
  {
    quote: 'The skill assessments and interview coach gave me the confidence to ace my interviews!',
    name: 'Rahul D.',
    title: 'Graduate, UK',
    avatar: '🎓',
    icon: UserCheck,
    color: 'text-pink-500'
  }
  ];

  const partners = [
  { name: 'Google', logo: '🔍', url: 'https://careers.google.com' },
  { name: 'Microsoft', logo: '🪟', url: 'https://careers.microsoft.com' },
  { name: 'Apple', logo: '🍎', url: 'https://jobs.apple.com' },
  { name: 'Meta', logo: '📘', url: 'https://careers.meta.com' },
  { name: 'Amazon', logo: '📦', url: 'https://amazon.jobs' },
  { name: 'Netflix', logo: '🎬', url: 'https://jobs.netflix.com' },
  { name: 'Tesla', logo: '⚡', url: 'https://tesla.com/careers' },
  { name: 'Uber', logo: '🚗', url: 'https://uber.com/careers' },
  { name: 'Spotify', logo: '🎵', url: 'https://lifeatspotify.com' },
  { name: 'Airbnb', logo: '🏠', url: 'https://careers.airbnb.com' },
  { name: 'LinkedIn', logo: '💼', url: 'https://careers.linkedin.com' },
  { name: 'Slack', logo: '💬', url: 'https://slack.com/careers' }
  ];

  const values = [
    {
    icon: Heart,
    color: 'from-pink-500 to-red-500',
    title: 'People First',
    desc: 'We put people at the center of everything we do.'
    },
    {
      icon: Lightbulb,
    color: 'from-green-500 to-emerald-500',
    title: 'Innovation',
    desc: 'We continuously innovate to create better solutions.'
    },
    {
      icon: Trophy,
    color: 'from-purple-500 to-pink-500',
    title: 'Excellence',
    desc: 'We strive for excellence in every interaction.'
  },
  {
    icon: Shield,
    color: 'from-blue-500 to-cyan-500',
    title: 'Security',
    desc: 'Your data and privacy are our top priority.'
    }
  ];

const howItWorks = [
  {
    icon: Sparkles,
    color: 'from-blue-500 to-purple-500',
    title: 'Sign Up',
    desc: 'Create your free account and set up your profile.'
  },
  {
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    title: 'Get Matched',
    desc: 'Receive personalized job recommendations instantly.'
  },
  {
    icon: Award,
    color: 'from-orange-500 to-yellow-500',
    title: 'Achieve Success',
    desc: 'Apply, interview, and land your dream job or hire top talent.'
  }
  ];

export default function About() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  // Background particles (match Login page vibe)
  const particles = useMemo(() => (
    Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10
    }))
  ), []);
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-x-hidden">
      {/* Floating particles (subtle) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="pointer-events-none absolute rounded-full bg-blue-500/10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`
          }}
        />
      ))}
      {/* Animated background shapes */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-cyan-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-violet-200/40 to-orange-200/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-200/40 to-teal-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* HERO SECTION */}
      <section className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 py-20 px-4 md:px-12 lg:px-24">
        {/* Left: Title and Mission */}
        <div className="flex-1 min-w-[280px] text-center md:text-left space-y-6">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 mb-4 animate-fade-in">
            <span className="text-xs font-semibold text-blue-700 tracking-widest uppercase">Welcome to SmartHire</span>
      </div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent leading-tight animate-gradient-x">
              Empowering the Next Generation
            <br />
            <span className="text-3xl md:text-5xl block mt-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">of Innovators</span>
            </h1>
          <p className="text-lg md:text-xl text-gray-700 font-medium animate-fade-in mt-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">We're on a mission</span> to connect talented individuals with their dream opportunities.
          </p>
          <p className="text-base md:text-lg text-gray-600 animate-fade-in">
            SmartHire revolutionizes the job search experience through <span className="font-semibold text-blue-700">intelligent matching</span>, <span className="font-semibold text-purple-700">personalized recommendations</span>, and <span className="font-semibold text-pink-700">cutting-edge technology integration</span>.
          </p>
          </div>
        {/* Right: Stats and CTA */}
        <div className="flex-1 min-w-[280px] flex flex-col items-center justify-center">
          <div className="relative w-full max-w-xs bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 animate-fade-in group hover:scale-105 transition-transform duration-500">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">2M+</div>
                <div className="text-xs text-gray-600 font-medium">Users Empowered</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-xs text-gray-600 font-medium">Success Rate</div>
                      </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">25K+</div>
                <div className="text-xs text-gray-600 font-medium">Partner Companies</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mb-2 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">500K+</div>
                <div className="text-xs text-gray-600 font-medium">Dreams Realized</div>
              </div>
            </div>
            <Button className="w-full py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden" onClick={() => setShowJoinModal(true)}>
              <span className="relative z-10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 mr-2 animate-bounce" />
                Join Our Mission
                <ArrowRight className="h-5 w-5 ml-2" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl blur-xl"></span>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST INDICATORS (consistent with Login) */}
      <section className="relative z-10 py-8 px-4 md:px-12 lg:px-24">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/40 shadow-xl max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 p-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Award Winning</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SMARTHIRE SECTION */}
      <section className="relative z-10 py-16 px-4 md:px-12 lg:px-24">
          <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why SmartHire?</h2>
          <p className="text-xl text-gray-600">What makes us the #1 platform for job seekers and employers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
            <Smile className="h-12 w-12 text-blue-500 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <h3 className="font-semibold text-xl mb-2">User-Centric Design</h3>
            <p className="text-gray-600 text-base">Intuitive, accessible, and delightful experience for all users.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
            <ThumbsUp className="h-12 w-12 text-green-500 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <h3 className="font-semibold text-xl mb-2">Proven Success</h3>
            <p className="text-gray-600 text-base">95% placement rate and thousands of success stories.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
            <Globe className="h-12 w-12 text-purple-500 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <h3 className="font-semibold text-xl mb-2">Global Reach</h3>
            <p className="text-gray-600 text-base">Opportunities and partners in 50+ countries worldwide.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
            <UserCheck className="h-12 w-12 text-pink-500 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <h3 className="font-semibold text-xl mb-2">AI-Powered Matching</h3>
            <p className="text-gray-600 text-base">Smart algorithms connect you to the best-fit jobs and talent.</p>
                  </div>
                </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative z-10 py-16 px-4 md:px-12 lg:px-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Get started in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {howItWorks.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
              {step.icon && (
                React.createElement(step.icon, {
                  className: `h-12 w-12 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform bg-gradient-to-r ${step.color} text-white p-2 rounded-xl`
                })
              )}
              <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
              <p className="text-gray-600 text-base">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

      {/* PARTNERS MARQUEE */}
      <section className="relative z-10 py-10 px-4 md:px-12 lg:px-24">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Trusted by Leading Brands</h2>
        </div>
        <div className="overflow-x-auto whitespace-nowrap flex items-center gap-8 py-4 animate-marquee">
          {partners.map((p, idx) => (
            <a key={idx} href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex flex-col items-center px-6 py-2 bg-white/80 rounded-xl shadow hover:shadow-lg transition-all min-w-[120px]">
              <span className="text-4xl mb-2">{p.logo}</span>
              <span className="text-sm font-semibold text-gray-700">{p.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS CAROUSEL */}
      <section className="relative z-10 py-16 px-4 md:px-12 lg:px-24">
          <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600">Real stories from our successful candidates and partners</p>
          </div>
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-2xl">
            <div className="bg-white/90 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center animate-fade-in">
              <span className="text-5xl mb-4">{testimonials[testimonialIdx].avatar}</span>
              {testimonials[testimonialIdx].icon && (
                React.createElement(testimonials[testimonialIdx].icon, {
                  className: `h-8 w-8 mb-2 ${testimonials[testimonialIdx].color}`
                })
              )}
              <p className="text-gray-700 italic mb-4 text-lg">“{testimonials[testimonialIdx].quote}”</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{testimonials[testimonialIdx].name}</span>
                  </div>
              <span className="text-xs text-gray-500">{testimonials[testimonialIdx].title}</span>
                </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-3 h-3 rounded-full ${testimonialIdx === idx ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                  onClick={() => setTestimonialIdx(idx)}
                  aria-label={`Show testimonial ${idx + 1}`}
                />
            ))}
            </div>
          </div>
          </div>
        </section>

      {/* TEAM SECTION */}
      <section className="relative z-10 py-16 px-4 md:px-12 lg:px-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate innovators behind SmartHire's success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
            <div key={member.id} className="relative text-center bg-white/80 rounded-3xl shadow-2xl p-8 group hover:scale-105 transition-transform duration-500 border-2 border-transparent hover:border-blue-400">
                  <div className="relative mb-6">
                      <img
                        src={member.image}
                        alt={member.name}
                  className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-500"
                        style={{ filter: 'contrast(1.1) brightness(1.1)' }}
                      />
                      <div className="absolute inset-0 w-full h-full rounded-full border-2 border-blue-400/50 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
                    </div>
              <h3 className="text-xl font-bold mb-1 text-blue-700 group-hover:text-blue-900 transition-colors duration-300">{member.name}</h3>
              <div className="text-blue-600 font-medium text-sm mb-1">{member.role}</div>
              <div className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 rounded px-2 py-1 inline-block mb-2">{member.subRole}</div>
                  <div className="flex flex-wrap gap-1 mb-4 justify-center">
                    {member.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-gray-100/80 text-gray-700 rounded px-2 py-1">{skill}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {member.achievements.map((achieve, idx) => (
                  <span key={idx} className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200 rounded px-2 py-1 border">{achieve}</span>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4">
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-all duration-300 hover:scale-125 transform">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-all duration-300 hover:scale-125 transform">
                      <Github className="h-5 w-5" />
                    </a>
                    <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-125 transform">
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
            </div>
            ))}
          </div>
        </section>

      {/* VALUES SECTION */}
      <section className="relative z-10 py-16 px-4 md:px-12 lg:px-24">
          <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-8 bg-white/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all group cursor-pointer">
              {value.icon && (
                React.createElement(value.icon, {
                  className: `h-12 w-12 mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform bg-gradient-to-r ${value.color} text-white p-2 rounded-xl`
                })
              )}
              <h3 className="font-semibold text-xl mb-2">{value.title}</h3>
              <p className="text-gray-600 text-base">{value.desc}</p>
            </div>
              ))}
          </div>
        </section>

      {/* JOIN MISSION MODAL */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              <Sparkles className="h-7 w-7 text-blue-600 animate-bounce" />Join SmartHire
            </DialogTitle>
            <DialogDescription className="text-base text-gray-700 mt-2">Be part of a community that empowers your career journey. Sign up now and unlock your dream job!</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg py-3">
              <a href="/register">Create Account</a>
            </Button>
            <Button asChild variant="outline" className="w-full text-lg py-3">
              <a href="/jobs">Browse Jobs</a>
            </Button>
            <Button asChild variant="ghost" className="w-full" onClick={() => setShowJoinModal(false)}>
              <span className="flex items-center gap-2"><X className="h-4 w-4" />Close</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
