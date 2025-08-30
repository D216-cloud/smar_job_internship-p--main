const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'company'], required: true },
  resumeUrl: { type: String },
  resumePublicId: { type: String }
});

module.exports = mongoose.model('User', userSchema);