const express = require('express');
const router = express.Router();
const { generateJSON, getDeepseekConfig } = require('../utils/llmClient');

// Test DeepSeek API endpoint
router.get('/test-deepseek', async (req, res) => {
  try {
    console.log('🧪 Testing DeepSeek API...');
    
    const cfg = getDeepseekConfig();
    if (!cfg.ok) {
      return res.json({
        success: false,
        error: 'DeepSeek not configured',
        reason: cfg.reason || 'unknown'
      });
    }

    const testPrompt = 'Please respond with a JSON object containing: {"status": "working", "message": "DeepSeek API is functioning correctly"}';
    
    const result = await generateJSON(testPrompt, { timeoutMs: 10000 });
    
    if (!result.ok) {
      return res.json({
        success: false,
        error: 'DeepSeek API call failed',
        details: result.error
      });
    }

    // Try to parse the response
    let parsed = null;
    try {
      const cleaned = result.text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // If JSON parsing fails, still consider it working if we got a response
      parsed = { status: 'working', message: 'Got response but not JSON: ' + result.text.substring(0, 100) };
    }

    res.json({
      success: true,
      deepseekWorking: true,
      response: parsed,
      provider: cfg.provider
    });

  } catch (error) {
    console.error('DeepSeek test error:', error);
    res.json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
});

module.exports = router;
