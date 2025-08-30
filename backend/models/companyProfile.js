const mongoose = require('mongoose');

const CompanyProfileSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  industry: { type: String, default: '' },
  size: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  foundedYear: { type: String, default: '' },
  revenue: { type: String, default: '' },
  employeeCount: { type: Number, default: 0 },
  benefits: { type: [String], default: [] },
  technologies: { type: [String], default: [] },
  companyType: { type: String, default: '' },
  remotePolicy: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  totalApplications: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CompanyProfileSchema.methods.getCompletionPercentage = function() {
  let completed = 0;
  let total = 0;

  // Basic Information
  if (this.name) completed++;
  if (this.email) completed++;
  if (this.phone) completed++;
  if (this.location) completed++;
  total += 4;

  // Company Information
  if (this.industry) completed++;
  if (this.size) completed++;
  if (this.description) completed++;
  if (this.website) completed++;
  total += 4;

  // Social Links
  if (this.linkedin) completed++;
  if (this.twitter) completed++;
  if (this.facebook) completed++;
  total += 3;

  // Additional Information
  if (this.logo) completed++;
  if (this.foundedYear) completed++;
  if (this.employeeCount) completed++;
  if (this.technologies && this.technologies.length > 0) completed++;
  total += 4;

  return Math.round((completed / total) * 100);
};

CompanyProfileSchema.methods.getPublicData = function() {
  return {
    _id: this._id,
    name: this.name,
    industry: this.industry,
    location: this.location,
    website: this.website,
    description: this.description,
    logo: this.logo,
    linkedin: this.linkedin,
    twitter: this.twitter,
    facebook: this.facebook,
    technologies: this.technologies,
    employeeCount: this.employeeCount,
    completion: this.getCompletionPercentage(),
    views: this.views
  };
};

CompanyProfileSchema.methods.incrementViews = async function() {
  this.views = (this.views || 0) + 1;
  await this.save();
};

CompanyProfileSchema.methods.incrementApplications = async function() {
  this.totalApplications = (this.totalApplications || 0) + 1;
  await this.save();
};

CompanyProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CompanyProfile', CompanyProfileSchema);
