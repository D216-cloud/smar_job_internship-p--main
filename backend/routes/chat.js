const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generateStrictJSON, isConfigured: isGeminiConfigured } = require('../utils/geminiClient');

// Chat endpoint using Gemini API
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message, apiKey } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

  // We rely on server GEMINI_API_KEY; ignore client apiKey to avoid misuse
  if (!isGeminiConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'AI service not configured (GEMINI_API_KEY missing)'
      });
    }

    console.log('💬 Chat request from user:', req.user.firstName);
    console.log('📝 Message:', message.substring(0, 100) + '...');

    // Call Gemini API
    const response = await generateStrictJSON(
      `You are a helpful AI assistant. Please respond to the user's message in a conversational and helpful manner.

User message: ${message}

Please provide a clear, helpful response.`,
      { timeoutMs: 30000 }
    );

    if (!response.ok) {
      console.error('❌ Gemini API error:', response.error);
      return res.status(500).json({
        success: false,
        error: response.error || 'Failed to get AI response'
      });
    }

    const aiReply = response.text || 'Sorry, I could not generate a response.';
    
    console.log('✅ Gemini response received, length:', aiReply.length);

    res.json({
      success: true,
      message: aiReply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get chat history (placeholder for future implementation)
router.get('/history', authMiddleware, async (req, res) => {
  try {
    // For now, return empty history
    // In the future, you could store chat history in MongoDB
    res.json({
      success: true,
      history: []
    });
  } catch (error) {
    console.error('❌ Chat history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
});

module.exports = router;
