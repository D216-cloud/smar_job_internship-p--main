// Shared job data store
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  benefits?: string;
  skills?: string[];
  category: string;
  experienceLevel: string;
  isRemote: boolean;
  applicationDeadline?: string;
  postedDate: string;
  isActive: boolean;
  logo?: string;
  isUrgent?: boolean;
  applicants?: number;
  views?: number;
  postingType?: string;
}

// Mock job data - in real app this would come from database
let jobsDatabase: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-Time",
    salary: "$120,000 - $160,000",
    description: "We're looking for a senior frontend developer to join our growing team and build amazing user experiences using React, TypeScript, and modern web technologies.",
    requirements: "5+ years of React experience, TypeScript proficiency, experience with modern frontend build tools",
    benefits: "Health insurance, 401k matching, flexible work hours, remote work options",
    skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
    category: "technology",
    experienceLevel: "senior",
    isRemote: true,
    postedDate: "2 days ago",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop&crop=center",
    applicants: 45,
    views: 1250,
    isUrgent: false,
    postingType: "job"
  },
  {
    id: "2",
    title: "Product Manager",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-Time",
    salary: "$100,000 - $140,000",
    description: "Drive product strategy and execution for our flagship SaaS platform and work with cross-functional teams to deliver amazing user experiences.",
    requirements: "3+ years of product management experience, analytics skills, SaaS experience preferred",
    benefits: "Equity package, comprehensive health benefits, unlimited PTO",
    skills: ["Product Strategy", "Analytics", "SaaS", "Agile"],
    category: "marketing",
    experienceLevel: "mid",
    isRemote: false,
    postedDate: "1 week ago",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center",
    applicants: 78,
    views: 2100,
    isUrgent: true,
    postingType: "job"
  },
  {
    id: "3",
    title: "UX Designer",
    company: "Design Studio",
    location: "Remote",
    type: "Contract",
    salary: "$80,000 - $110,000",
    description: "Create beautiful and intuitive user experiences for mobile applications and web platforms using modern design tools and methodologies.",
    requirements: "3+ years of UX design experience, Figma proficiency, user research experience",
    benefits: "Flexible schedule, remote work, creative freedom",
    skills: ["Figma", "User Research", "Prototyping", "UI Design"],
    category: "design",
    experienceLevel: "mid",
    isRemote: true,
    postedDate: "3 days ago",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=100&h=100&fit=crop&crop=center",
    applicants: 32,
    views: 890,
    isUrgent: false,
    postingType: "job"
  }
];

// Mock internship data
let internshipsDatabase: Job[] = [
  {
    id: "int1",
    title: "Software Engineering Intern",
    company: "Google",
    location: "Mountain View, CA",
    type: "Summer Internship",
    salary: "$8,000/month",
    description: "Join our engineering team and work on real projects that impact millions of users worldwide. Learn from experienced engineers and contribute to cutting-edge technology.",
    requirements: "Currently pursuing a degree in Computer Science or related field, strong programming skills",
    benefits: "Free meals, transportation, housing allowance, mentorship program",
    skills: ["Python", "Java", "JavaScript", "Data Structures", "Algorithms"],
    category: "technology",
    experienceLevel: "entry",
    isRemote: false,
    postedDate: "1 week ago",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&h=100&fit=crop&crop=center",
    applicants: 120,
    views: 3500,
    isUrgent: true,
    postingType: "internship"
  },
  {
    id: "int2",
    title: "Marketing Intern",
    company: "Facebook",
    location: "Menlo Park, CA",
    type: "Summer Internship",
    salary: "$6,500/month",
    description: "Gain hands-on experience in digital marketing, social media strategy, and brand management. Work with a team of marketing professionals on real campaigns.",
    requirements: "Currently pursuing a degree in Marketing, Communications, or related field",
    benefits: "Networking opportunities, skill development, potential full-time offer",
    skills: ["Social Media Marketing", "Content Creation", "Analytics", "Creative Design"],
    category: "marketing",
    experienceLevel: "entry",
    isRemote: false,
    postedDate: "2 weeks ago",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center",
    applicants: 85,
    views: 2100,
    isUrgent: false,
    postingType: "internship"
  },
  {
    id: "int3",
    title: "Data Science Intern",
    company: "Netflix",
    location: "Los Gatos, CA",
    type: "Summer Internship",
    salary: "$7,500/month",
    description: "Work with large datasets to extract insights and help drive business decisions. Learn about machine learning, statistical analysis, and data visualization.",
    requirements: "Currently pursuing a degree in Statistics, Mathematics, Computer Science, or related field",
    benefits: "Competitive salary, learning opportunities, networking events",
    skills: ["Python", "R", "SQL", "Machine Learning", "Statistics"],
    category: "technology",
    experienceLevel: "entry",
    isRemote: false,
    postedDate: "3 days ago",
    isActive: true,
    logo: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=100&h=100&fit=crop&crop=center",
    applicants: 95,
    views: 2800,
    isUrgent: true,
    postingType: "internship"
  }
];

// Job management functions
export const getAllJobs = (): Job[] => {
  return jobsDatabase.filter(job => job.isActive);
};

export const getAllInternships = (): Job[] => {
  return internshipsDatabase.filter(internship => internship.isActive);
};

export const getJobById = (id: string): Job | undefined => {
  return jobsDatabase.find(job => job.id === id && job.isActive);
};

export const getInternshipById = (id: string): Job | undefined => {
  return internshipsDatabase.find(internship => internship.id === id && internship.isActive);
};

export const addJob = (jobData: Omit<Job, 'id' | 'postedDate' | 'isActive' | 'applicants' | 'views'>): Job => {
  const newJob: Job = {
    ...jobData,
    id: Date.now().toString(),
    postedDate: 'Just posted',
    isActive: true,
    applicants: 0,
    views: 0
  };
  
  jobsDatabase.push(newJob);
  return newJob;
};

export const addInternship = (internshipData: Omit<Job, 'id' | 'postedDate' | 'isActive' | 'applicants' | 'views'>): Job => {
  const newInternship: Job = {
    ...internshipData,
    id: `int${Date.now()}`,
    postedDate: 'Just posted',
    isActive: true,
    applicants: 0,
    views: 0
  };
  
  internshipsDatabase.push(newInternship);
  return newInternship;
};

export const updateJob = (id: string, updates: Partial<Job>): Job | null => {
  const jobIndex = jobsDatabase.findIndex(job => job.id === id);
  if (jobIndex === -1) return null;
  
  jobsDatabase[jobIndex] = { ...jobsDatabase[jobIndex], ...updates };
  return jobsDatabase[jobIndex];
};

export const updateInternship = (id: string, updates: Partial<Job>): Job | null => {
  const internshipIndex = internshipsDatabase.findIndex(internship => internship.id === id);
  if (internshipIndex === -1) return null;
  
  internshipsDatabase[internshipIndex] = { ...internshipsDatabase[internshipIndex], ...updates };
  return internshipsDatabase[internshipIndex];
};

export const deleteJob = (id: string): boolean => {
  const jobIndex = jobsDatabase.findIndex(job => job.id === id);
  if (jobIndex === -1) return false;
  
  jobsDatabase[jobIndex].isActive = false;
  return true;
};

export const deleteInternship = (id: string): boolean => {
  const internshipIndex = internshipsDatabase.findIndex(internship => internship.id === id);
  if (internshipIndex === -1) return false;
  
  internshipsDatabase[internshipIndex].isActive = false;
  return true;
};

export const searchJobs = (query: string): Job[] => {
  const lowercaseQuery = query.toLowerCase();
  return jobsDatabase.filter(job => 
    job.isActive && (
      job.title.toLowerCase().includes(lowercaseQuery) ||
      job.company.toLowerCase().includes(lowercaseQuery) ||
      job.location.toLowerCase().includes(lowercaseQuery) ||
      (job.skills && job.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)))
    )
  );
};

export const searchInternships = (query: string): Job[] => {
  const lowercaseQuery = query.toLowerCase();
  return internshipsDatabase.filter(internship => 
    internship.isActive && (
      internship.title.toLowerCase().includes(lowercaseQuery) ||
      internship.company.toLowerCase().includes(lowercaseQuery) ||
      internship.location.toLowerCase().includes(lowercaseQuery) ||
      (internship.skills && internship.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)))
    )
  );
};