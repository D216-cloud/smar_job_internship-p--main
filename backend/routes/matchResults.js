const express = require('express');
const router = express.Router();
const MatchResult = require('../models/matchResult');
const auth = require('../middleware/auth');

// GET /api/match-results - list matches for current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const results = await MatchResult.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, results });
  } catch (err) {
    console.error('matchResults list error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/match-results/:id - get a single match result (if owned)
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user && (req.user.userId || req.user.id);
    const m = await MatchResult.findById(req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    if (m.userId.toString() !== userId.toString()) return res.status(403).json({ error: 'Forbidden' });
    res.json({ success: true, result: m });
  } catch (err) {
    console.error('matchResults get error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
