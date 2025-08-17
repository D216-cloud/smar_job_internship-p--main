
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Clock, MessageCircle, Users, TrendingUp, Globe, Target, ArrowRight, Zap, CheckCircle, Star, Shield } from 'lucide-react';
import WelcomeNotification from '@/components/WelcomeNotification';

const Contact = () => {
  // Floating particles like Login page
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "deepak.maheta117671@marwadiuniversity.ac.in",
      description: "Send us an email",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+91 8849719200",
      description: "Call us directly",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      label: "Office",
      value: "Kalawad road rajkot Gujarat",
      description: "Visit our headquarters",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      label: "Hours",
      value: "Mon-Fri: 9AM-9:30PM PST",
      description: "Our business hours",
      color: "from-orange-500 to-yellow-500"
    }
  ];

  const stats = [
    { icon: MessageCircle, label: "Messages Received", value: "10K+", color: "from-blue-500 to-cyan-500" },
    { icon: Users, label: "Happy Customers", value: "25K+", color: "from-green-500 to-emerald-500" },
    { icon: TrendingUp, label: "Response Rate", value: "98%", color: "from-purple-500 to-pink-500" },
    { icon: Clock, label: "Avg Response Time", value: "< 2h", color: "from-orange-500 to-yellow-500" }
  ];

  const quickHelp = [
    "How to post a job?",
    "How to create a profile?",
    "Pricing information",
    "Account support",
    "Technical issues",
    "Partnership inquiries"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
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
      {/* Welcome Notification Bar */}
      <WelcomeNotification />

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl transform rotate-12 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-cyan-200/40 to-pink-200/40 rounded-full blur-3xl transform -rotate-12 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative bg-white/80 backdrop-blur-xl border-b border-white/30 paper-fold-shadow">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 to-purple-50/60"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-3 transition-transform duration-300">
                  <MessageCircle className="h-12 w-12 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 gradient-text animate-fade-in">
              Contact Us
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="glass shadow-soft hover:shadow-medium transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Get in Touch</CardTitle>
                      <CardDescription>Fill out the form below and we'll get back to you shortly</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-700">Name *</label>
                        <Input
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                          className="h-12 bg-white/80 border-white/30 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-700">Email *</label>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="h-12 bg-white/80 border-white/30 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-700">Inquiry Type</label>
                      <Select onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger className="h-12 bg-white/80 border-white/30 rounded-xl">
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Question</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="press">Press Inquiry</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-700">Subject *</label>
                      <Input
                        placeholder="Brief subject of your message"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                        className="h-12 bg-white/80 border-white/30 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-700">Message *</label>
                      <Textarea
                        placeholder="Tell us more about your question or feedback..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                        className="bg-white/80 border-white/30 rounded-xl resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Send Message
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Contact Information</h2>
                </div>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="glass p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300`}>
                            <info.icon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 text-lg">{info.label}</h3>
                          <p className="text-gray-900 mb-2 font-medium">{info.value}</p>
                          <p className="text-sm text-gray-600">{info.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Map Placeholder */}
              <Card className="glass p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Our Location</h3>
                </div>
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                  <div className="text-center text-gray-500 relative z-10">
                    <MapPin className="h-16 w-16 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">Interactive map would be here</p>
                    <p className="text-sm">San Francisco, CA</p>
                  </div>
                </div>
              </Card>

              {/* FAQ Quick Links */}
              <Card className="glass p-6 shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">Quick Help</h3>
                </div>
                <div className="space-y-3">
                  {quickHelp.map((item, index) => (
                    <a 
                      key={index}
                      href="#" 
                      className="flex items-center gap-3 text-blue-600 hover:text-blue-700 text-sm p-3 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors duration-200 group"
                    >
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-200" />
                      {item}
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <section className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-white/40 shadow-xl max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Follow Us</h2>
            <p className="text-gray-600 mb-8">Stay connected with us on social media for updates and insights</p>
            <div className="flex justify-center space-x-6">
              {['LinkedIn', 'Twitter', 'Instagram'].map((platform, index) => (
                <a key={platform} href="#" className="group">
                  <div className="w-14 h-14 bg-gradient-to-r from-gray-100 to-white rounded-2xl flex items-center justify-center hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 border border-gray-200 hover:border-blue-300">
                    <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300">{platform.slice(0, 2)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* Trust indicators (consistent with Login) */}
      <section className="mt-12 mb-12 text-center relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-white/40 shadow-xl max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 p-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Fast Response</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
