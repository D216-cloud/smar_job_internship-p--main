const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: false },
  location: { type: String, required: true },
  type: { type: String, required: false }, // full-time, part-time, contract, internship
  postingType: { type: String, required: true }, // 'job' or 'internship'
  salary: { type: String, required: false },
  description: { type: String, required: true },
  requirements: { type: String, required: false },
  benefits: { type: String, required: false },
  resumeRequired: { type: String, required: false },
  skills: { type: String, required: false },
  category: { type: String, required: false },
  experienceLevel: { type: String, required: false },
  isRemote: { type: String, required: false },
  applicationDeadline: { type: String, required: false },
  applicationInstructions: { type: String, required: false },
  isUrgent: { type: String, required: false },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);