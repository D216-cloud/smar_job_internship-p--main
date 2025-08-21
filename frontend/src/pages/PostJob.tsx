import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Building, MapPin, DollarSign, Clock, Briefcase, Target, Globe, CheckCircle, Zap, Star, Calendar, Tags, Users, Laptop, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/context/AuthContext';

const PostJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    postingType: '',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    resumeRequired: 'false',
    skills: '',
    category: '',
    experienceLevel: '',
    isRemote: 'false',
    applicationDeadline: '',
    applicationInstructions: '',
    isUrgent: 'false',
    companyId: ''
  });
  const { userData } = useAuthContext();
  const [companyIdError, setCompanyIdError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState({
    logo: null as File | null,
    documents: [] as File[]
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userData) {
      setJobData(prev => ({
        ...prev,
        companyId: (userData?.companyId as string) || prev.companyId,
        company: (userData?.companyName as string) || prev.company
      }));
    }
  }, [userData]);

  const handleInputChange = (field: string, value: string) => {
    setJobData(prev => {
      if (field === 'type' && value === 'internship') {
        return { ...prev, [field]: value, postingType: 'internship' };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleFileUpload = (type: 'logo' | 'documents', files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setTimeout(() => {
      if (type === 'logo') {
        setUploadedFiles(prev => ({ ...prev, logo: files[0] }));
      } else {
        const newFiles = Array.from(files);
        setUploadedFiles(prev => ({ ...prev, documents: [...prev.documents, ...newFiles] }));
      }
      setUploading(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobData.companyId || jobData.companyId.trim() === '') {
      setCompanyIdError('Company ID is required.');
      toast({ title: 'Error', description: 'Company ID is required.', variant: 'destructive' });
      return;
    }
    setCompanyIdError('');
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(jobData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (uploadedFiles.logo) {
        formData.append('logo', uploadedFiles.logo);
      }
      uploadedFiles.documents.forEach((doc, index) => {
        formData.append(`documents[${index}]`, doc);
      });
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({ title: 'Unauthorized', description: 'Session expired or not authorized. Please log in again.', variant: 'destructive' });
        } else {
          toast({ title: 'Error', description: 'Error posting job', variant: 'destructive' });
        }
        return;
      }
      toast({ title: 'Success', description: 'Job posted successfully!', variant: 'default' });
      setJobData({
        title: '',
        company: (userData?.companyName as string) || '',
        location: '',
        type: '',
        postingType: '',
        salary: '',
        description: '',
        requirements: '',
        benefits: '',
        resumeRequired: 'false',
        skills: '',
        category: '',
        experienceLevel: '',
        isRemote: 'false',
        applicationDeadline: '',
        applicationInstructions: '',
        isUrgent: 'false',
        companyId: (userData?.companyId as string) || ''
      });
      setUploadedFiles({ logo: null, documents: [] });
    } catch (err) {
      toast({ title: 'Error', description: 'Error posting job', variant: 'destructive' });
    }
  };

  const employmentTypes = [
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];
  const postingTypes = [
    { value: 'job', label: 'Job Position' },
    { value: 'internship', label: 'Internship' }
  ];
  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'design', label: 'Design' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'other', label: 'Other' }
  ];
  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5+ years)' },
    { value: 'lead', label: 'Lead/Manager (7+ years)' },
    { value: 'executive', label: 'Executive (10+ years)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-tl from-cyan-200/30 to-pink-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <Card className="border-0 bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="pb-4 border-b border-gray-100/60 bg-gradient-to-r from-white/80 to-blue-50/50">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Briefcase className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Post a New Job</CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                          Fill in the details to attract top talent
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-220px)] overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-10">

                      {/* Basic Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Job Title *</label>
                          <Input
                            placeholder="e.g. Senior Frontend Developer"
                            value={jobData.title}
                            onChange={e => handleInputChange('title', e.target.value)}
                            required
                            className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Company Name *</label>
                          <Input
                            placeholder="Your company name"
                            value={jobData.company}
                            onChange={e => handleInputChange('company', e.target.value)}
                            required
                            className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            disabled={!!userData && !!userData.companyName}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Company ID *</label>
                          <Input
                            placeholder="Paste your MongoDB company _id here"
                            value={jobData.companyId}
                            onChange={e => handleInputChange('companyId', e.target.value)}
                            required
                            className={`h-12 bg-white border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                              companyIdError ? 'border-red-300 focus:ring-red-500' : 'border-gray-200'
                            }`}
                            disabled={!!userData && !!userData.companyId}
                          />
                          {companyIdError && (
                            <motion.p
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-red-600 mt-1"
                            >
                              {companyIdError}
                            </motion.p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Location *</label>
                            <Input
                              placeholder="e.g. San Francisco, CA"
                              value={jobData.location}
                              onChange={e => handleInputChange('location', e.target.value)}
                              required
                              className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Posting Type *</label>
                            <Select onValueChange={value => handleInputChange('postingType', value)} value={jobData.postingType}>
                              <SelectTrigger className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Select posting type" />
                              </SelectTrigger>
                              <SelectContent>
                                {postingTypes.map(pt => (
                                  <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Employment Type *</label>
                            <Select onValueChange={value => handleInputChange('type', value)} value={jobData.type}>
                              <SelectTrigger className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Select employment type" />
                              </SelectTrigger>
                              <SelectContent>
                                {employmentTypes.map(et => (
                                  <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Salary Range</label>
                          <Input
                            placeholder="e.g. ₹80,000 - ₹120,000"
                            value={jobData.salary}
                            onChange={e => handleInputChange('salary', e.target.value)}
                            className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Job Description */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                            <Globe className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">Job Description</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Job Description *</label>
                          <Textarea
                            placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                            rows={6}
                            value={jobData.description}
                            onChange={e => handleInputChange('description', e.target.value)}
                            required
                            className="bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Requirements *</label>
                          <Textarea
                            placeholder="List the required skills, experience, and qualifications..."
                            rows={4}
                            value={jobData.requirements}
                            onChange={e => handleInputChange('requirements', e.target.value)}
                            required
                            className="bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Benefits & Perks</label>
                          <Textarea
                            placeholder="Describe the benefits, perks, and what makes your company great..."
                            rows={4}
                            value={jobData.benefits}
                            onChange={e => handleInputChange('benefits', e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                            <Tags className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">Additional Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Job Category *</label>
                            <Select onValueChange={value => handleInputChange('category', value)} value={jobData.category}>
                              <SelectTrigger className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Experience Level *</label>
                            <Select onValueChange={value => handleInputChange('experienceLevel', value)} value={jobData.experienceLevel}>
                              <SelectTrigger className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                              <SelectContent>
                                {experienceLevels.map(exp => (
                                  <SelectItem key={exp.value} value={exp.value}>{exp.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Required Skills</label>
                          <Input
                            placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                            value={jobData.skills}
                            onChange={e => handleInputChange('skills', e.target.value)}
                            className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Application Deadline</label>
                            <Input
                              type="date"
                              value={jobData.applicationDeadline}
                              onChange={e => handleInputChange('applicationDeadline', e.target.value)}
                              className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <input
                                type="checkbox"
                                id="isRemote"
                                checked={jobData.isRemote === 'true'}
                                onChange={e => handleInputChange('isRemote', e.target.checked.toString())}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <label htmlFor="isRemote" className="text-sm text-gray-700 flex items-center gap-2">
                                <Laptop className="h-4 w-4" /> Remote Work
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <input
                                type="checkbox"
                                id="isUrgent"
                                checked={jobData.isUrgent === 'true'}
                                onChange={e => handleInputChange('isUrgent', e.target.checked.toString())}
                                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                              />
                              <label htmlFor="isUrgent" className="text-sm text-gray-700 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" /> Urgent Hiring
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Application Instructions</label>
                          <Textarea
                            placeholder="Provide specific instructions for applicants..."
                            rows={3}
                            value={jobData.applicationInstructions}
                            onChange={e => handleInputChange('applicationInstructions', e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Company Branding */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                            <Building className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900">Company Branding</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Company Logo</label>
                          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-white hover:bg-blue-50/50 transition-colors">
                            <AnimatePresence>
                              {uploading && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl"
                                >
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                  >
                                    <Loader2 className="w-12 h-12 text-blue-600" />
                                  </motion.div>
                                  <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                    className="text-lg font-medium text-gray-700"
                                  >
                                    Uploading...
                                  </motion.span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2 text-lg">Upload your company logo</p>
                            <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 2MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleFileUpload('logo', e.target.files)}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label htmlFor="logo-upload">
                              <Button
                                variant="outline"
                                className="h-12 px-8 rounded-xl bg-white hover:bg-gray-50 shadow-sm cursor-pointer"
                                asChild
                              >
                                <span>Choose File</span>
                              </Button>
                            </label>
                            {uploadedFiles.logo && (
                              <motion.p
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-sm text-green-600 flex items-center gap-1 justify-center"
                              >
                                <CheckCircle className="h-4 w-4" /> {uploadedFiles.logo.name}
                              </motion.p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Additional Documents</label>
                          <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-white hover:bg-blue-50/50 transition-colors">
                            <AnimatePresence>
                              {uploading && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-2xl"
                                >
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                  >
                                    <Loader2 className="w-10 h-10 text-blue-600" />
                                  </motion.div>
                                  <motion.span
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                                    className="text-sm font-medium text-gray-700"
                                  >
                                    Uploading...
                                  </motion.span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-2">Upload job-related documents</p>
                            <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX up to 5MB each</p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              multiple
                              onChange={e => handleFileUpload('documents', e.target.files)}
                              className="hidden"
                              id="documents-upload"
                            />
                            <label htmlFor="documents-upload">
                              <Button
                                variant="outline"
                                className="h-10 px-6 rounded-xl bg-white hover:bg-gray-50 shadow-sm cursor-pointer"
                                asChild
                              >
                                <span>Choose Files</span>
                              </Button>
                            </label>
                            {uploadedFiles.documents.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 space-y-1"
                              >
                                {uploadedFiles.documents.map((file, index) => (
                                  <p key={index} className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-4 w-4" /> {file.name}
                                  </p>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Resume Upload</label>
                          <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <input
                              type="checkbox"
                              id="resumeRequired"
                              checked={jobData.resumeRequired === 'true'}
                              onChange={e => handleInputChange('resumeRequired', e.target.checked.toString())}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="resumeRequired" className="text-sm text-gray-700">Enable resume upload for applicants</label>
                          </div>
                        </div>
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex gap-4 pt-8">
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                          <Button
                            type="submit"
                            className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            Post Job <Zap className="h-5 w-5 ml-2" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-14 rounded-xl text-lg font-medium bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
                          >
                            Save as Draft
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar: Preview & Pricing */}
            <div className="lg:col-span-1 space-y-6">
              {/* Live Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="sticky top-6"
              >
                <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100/60 bg-gradient-to-r from-white/80 to-blue-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">Live Preview</CardTitle>
                        <CardDescription className="text-gray-600 text-sm">How your job posting will appear</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 p-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{jobData.title || 'Job Title'}</h3>
                      <p className="text-gray-600 flex items-center gap-1 text-sm mt-1">
                        <Building className="h-4 w-4" /> {jobData.company || 'Company Name'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {jobData.location && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 text-xs px-2.5 py-1">
                          <MapPin className="h-3 w-3" /> {jobData.location}
                        </Badge>
                      )}
                      {jobData.type && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-1">
                          <Clock className="h-3 w-3" /> {jobData.type}
                        </Badge>
                      )}
                      {jobData.salary && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 text-xs px-2.5 py-1">
                          <DollarSign className="h-3 w-3" /> {jobData.salary}
                        </Badge>
                      )}
                      {jobData.category && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-orange-50 text-orange-700 border-orange-200 text-xs px-2.5 py-1">
                          <Tags className="h-3 w-3" /> {jobData.category}
                        </Badge>
                      )}
                      {jobData.isRemote === 'true' && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-cyan-50 text-cyan-700 border-cyan-200 text-xs px-2.5 py-1">
                          <Laptop className="h-3 w-3" /> Remote
                        </Badge>
                      )}
                      {jobData.isUrgent === 'true' && (
                        <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200 text-xs px-2.5 py-1">
                          <AlertCircle className="h-3 w-3" /> Urgent
                        </Badge>
                      )}
                    </div>

                    {jobData.skills && (
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">Skills Required</h4>
                        <div className="flex flex-wrap gap-1">
                          {jobData.skills.split(',').map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 text-xs px-2 py-1">
                              {skill.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {jobData.applicationDeadline && (
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> Application Deadline
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{new Date(jobData.applicationDeadline).toLocaleDateString()}</p>
                      </div>
                    )}

                    {jobData.description && (
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">Description</h4>
                        <p className="text-xs text-gray-600 line-clamp-4">{jobData.description}</p>
                      </div>
                    )}

                    <Button
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-md text-sm font-medium"
                      disabled
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pricing Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="sticky top-[calc(6rem+420px)]"
              >
                <Card className="border-0 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100/60 bg-gradient-to-r from-white/80 to-green-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">Pricing</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <motion.div
                      className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div>
                        <span className="font-medium text-gray-900">Job Posting</span>
                        <p className="text-xs text-gray-600">30 days visibility</p>
                      </div>
                      <span className="font-semibold text-lg text-gray-900">₹199</span>
                    </motion.div>
                    <motion.div
                      className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div>
                        <span className="font-medium text-gray-900">Featured Listing</span>
                        <p className="text-xs text-gray-600">2x more visibility</p>
                      </div>
                      <span className="font-semibold text-lg text-gray-900">+₹99</span>
                    </motion.div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-semibold text-lg text-gray-900">
                        <span>Total</span>
                        <span className="text-green-600">₹199</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">What's Included</span>
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• 30 days active posting</li>
                        <li>• Candidate screening tools</li>
                        <li>• Analytics dashboard</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;