const express = require('express');
const router = express.Router();
const { generateStrictJSON, isConfigured: isGeminiConfigured, parseJsonRobust } = require('../utils/geminiClient');

// Test Gemini API endpoint
router.get('/test-gemini', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini API...');
    if (!isGeminiConfigured()) {
      return res.json({ success: false, error: 'Gemini not configured' });
    }

    const testPrompt = 'Return JSON {"status":"working","message":"Gemini API is functioning correctly"}';
    const result = await generateStrictJSON(testPrompt, { timeoutMs: 10000 });

    if (!result.ok) {
      return res.json({
        success: false,
        error: 'Gemini API call failed',
        details: result.error
      });
    }

    // Try to parse the response
    let parsed = null;
    try {
      parsed = parseJsonRobust(result.text);
    } catch (e) {
      // If JSON parsing fails, still consider it working if we got a response
      parsed = { status: 'working', message: 'Got response but not JSON: ' + (result.text || '').substring(0, 100) };
    }

    res.json({
      success: true,
      geminiWorking: true,
      response: parsed,
      provider: 'gemini'
    });

  } catch (error) {
    console.error('Gemini test error:', error);
    res.json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
});

module.exports = router;
