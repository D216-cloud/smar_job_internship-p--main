const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Made optional
  companyName: { type: String, required: true }, // Added company name field
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String },
  email: { type: String },
  phone: { type: String },
  coverLetter: { type: String },
  linkedIn: { type: String },
  portfolio: { type: String },
  currentCompany: { type: String },
  currentPosition: { type: String },
  experience: { type: String },
  skills: { type: String },
  expectedSalary: { type: String },
  startDate: { type: String },
  resume: { type: String }, // store filename or URL
  status: { type: String, default: 'applied', enum: ['applied', 'reviewing', 'interview', 'shortlisted', 'selected', 'rejected'] },
  appliedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema); 