const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  description: { type: String },
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  internshipsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', companySchema); 