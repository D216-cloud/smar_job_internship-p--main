const express = require('express');
const router = express.Router();
const { generateTerminalLog } = require('../utils/terminalLogger');
const auth = require('../middleware/auth');

// POST /api/terminal-log
// Body: { resume_source, job_title, job_id, steps: [], results: {} }
router.post('/', auth, (req, res) => {
  try {
    const payload = req.body || {};

    // Basic validation
    if (!payload.steps || !Array.isArray(payload.steps)) {
      return res.status(400).send('Bad Request: steps array required');
    }

    // Generate strict terminal-style log text
    const text = generateTerminalLog(payload);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch (err) {
    console.error('terminalLog error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
