const mongoose = require('mongoose');

const MatchResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, default: '' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  jobTitle: { type: String, default: '' },
  companyName: { type: String, default: '' },
  source: { type: String, enum: ['ai', 'fallback'], default: 'ai' },
  // Canonical fields for search and display
  fitScore: { type: Number, default: 0 },
  matchedSkills: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  evidence: { type: [String], default: [] },
  jobSnapshot: { type: mongoose.Schema.Types.Mixed },
  resumeSnapshot: { type: mongoose.Schema.Types.Mixed },
  rawAiResponse: { type: mongoose.Schema.Types.Mixed },
  match: { type: mongoose.Schema.Types.Mixed },
  terminalLog: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// indexes
MatchResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('MatchResult', MatchResultSchema);
