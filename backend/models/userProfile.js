const mongoose = require('mongoose');

const PersonalInfoSchema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'], default: 'prefer-not-to-say' }
}, { _id: false });

const ProfessionalBioSchema = new mongoose.Schema({
  bio: { type: String, default: '' },
  currentPosition: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  experience: { type: String, default: '' },
  availability: { type: String, enum: ['immediate', '2-weeks', '1-month', '3-months', 'flexible'], default: 'flexible' },
  remotePreference: { type: String, enum: ['remote', 'hybrid', 'onsite', 'flexible'], default: 'flexible' },
  expectedSalary: { type: String, default: '' },
  interests: { type: String, default: '' }
}, { _id: false });

const CertificationSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  issuer: { type: String, default: '' },
  date: { type: Date },
  expiry: { type: Date },
  credentialId: { type: String, default: '' }
}, { _id: false });

const SkillsSchema = new mongoose.Schema({
  technicalSkills: { type: String, default: '' },
  softSkills: { type: String, default: '' },
  languages: { type: [String], default: [] },
  certifications: { type: [CertificationSchema], default: [] }
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  fileUrl: { type: String, default: '' },
  secureUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 },
  uploadDate: { type: Date }
}, { _id: false });

const SocialLinksSchema = new mongoose.Schema({
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  twitter: { type: String, default: '' },
  website: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  instagram: { type: String, default: '' },
  facebook: { type: String, default: '' }
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  institution: { type: String, default: '' },
  degree: { type: String, default: '' },
  field: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  gpa: { type: String, default: '' },
  description: { type: String, default: '' },
  achievements: { type: [String], default: [] },
  isCurrent: { type: Boolean, default: false }
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  location: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  achievements: { type: [String], default: [] },
  technologies: { type: [String], default: [] }
}, { _id: false });

const SectionsCompletedSchema = new mongoose.Schema({
  personalInfo: { type: Boolean, default: false },
  professionalBio: { type: Boolean, default: false },
  skills: { type: Boolean, default: false },
  resume: { type: Boolean, default: false },
  socialLinks: { type: Boolean, default: false },
  educationHistory: { type: Boolean, default: false },
  experienceHistory: { type: Boolean, default: false }
}, { _id: false });

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  personalInfo: { type: PersonalInfoSchema, default: () => ({}) },
  professionalBio: { type: ProfessionalBioSchema, default: () => ({}) },
  skills: { type: SkillsSchema, default: () => ({}) },
  resume: { type: ResumeSchema, default: () => ({}) },
  socialLinks: { type: SocialLinksSchema, default: () => ({}) },
  educationHistory: { type: [EducationSchema], default: [] },
  experienceHistory: { type: [ExperienceSchema], default: [] },
  profilePicture: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  showContactInfo: { type: Boolean, default: true },
  showSalary: { type: Boolean, default: false },
  sectionsCompleted: { type: SectionsCompletedSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastSectionUpdated: { type: String, default: '' }
});

UserProfileSchema.methods.calculateCompletion = function() {
  const sections = [
    this.sectionsCompleted.personalInfo,
    this.sectionsCompleted.professionalBio,
    this.sectionsCompleted.skills,
    this.sectionsCompleted.resume,
    this.sectionsCompleted.socialLinks,
    this.sectionsCompleted.educationHistory,
    this.sectionsCompleted.experienceHistory
  ];
  const total = sections.length;
  const completed = sections.filter(Boolean).length;
  return Math.round((completed / total) * 100);
};

UserProfileSchema.methods.getCompletion = function() {
  return {
    completionPercentage: this.calculateCompletion(),
    sectionsCompleted: this.sectionsCompleted,
    sections: [
      'personalInfo',
      'professionalBio',
      'skills',
      'resume',
      'socialLinks',
      'educationHistory',
      'experienceHistory'
    ]
  };
};

UserProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
