const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generateJSON } = require('../utils/llmClient');

// Chat endpoint using DeepSeek API
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message, apiKey } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

  // Use provided API key or default from environment (support GEMINI_API_KEY fallback)
  const useApiKey = apiKey || process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY;

  if (!useApiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    console.log('💬 Chat request from user:', req.user.firstName);
    console.log('📝 Message:', message.substring(0, 100) + '...');

    // Call DeepSeek API
    const response = await generateJSON(
      `You are a helpful AI assistant. Please respond to the user's message in a conversational and helpful manner.

User message: ${message}

Please provide a clear, helpful response.`,
      { 
        timeoutMs: 30000,
        apiKey: useApiKey 
      }
    );

    if (!response.ok) {
      console.error('❌ DeepSeek API error:', response.error);
      return res.status(500).json({
        success: false,
        error: response.error || 'Failed to get AI response'
      });
    }

    const aiReply = response.text || 'Sorry, I could not generate a response.';
    
    console.log('✅ DeepSeek response received, length:', aiReply.length);

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
