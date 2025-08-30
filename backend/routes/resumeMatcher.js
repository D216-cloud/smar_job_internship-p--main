const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { analyzeResumeWithLLM } = require('../utils/resumeMatcher');

// POST /api/resume-matcher/analyze
router.post('/analyze', auth, async (req, res) => {
  const { resumeText, jobTitle, jobDescription, jobRequirements, filesList } = req.body || {};
  if (!resumeText || !jobTitle || !jobDescription) {
    return res.status(400).json({ error: 'resumeText, jobTitle and jobDescription are required' });
  }

  try {
    const result = await analyzeResumeWithLLM({ resumeText, jobTitle, jobDescription, jobRequirements, filesList });
    if (!result.ok) return res.status(502).json({ error: result.error, raw: result.raw });
    return res.json({ success: true, analysis: result.data });
  } catch (err) {
    console.error('Error in resume matcher route:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
