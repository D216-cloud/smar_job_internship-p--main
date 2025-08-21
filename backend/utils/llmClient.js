const axios = require('axios');

function getDeepseekConfig(customApiKey = null) {
  const key = customApiKey || process.env.OPENROUTER_API_KEY || '';
  if (!key) return { ok: false, reason: 'missing-key' };
  if (key.startsWith('sk-or-')) {
    return {
      ok: true,
      provider: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      model: process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-r1-0528:free',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://localhost:5000',
        'X-Title': 'Job Matching App'
      }
    };
  }
  return {
    ok: true,
    provider: 'deepseek',
    baseURL: 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    }
  };
}

async function generateJSON(prompt, { timeoutMs = 20000, apiKey = null } = {}) {
  const cfg = getDeepseekConfig(apiKey);
  if (!cfg.ok) return { ok: false, text: '', error: 'deepseek-not-configured' };
  try {
    const url = `${cfg.baseURL}/chat/completions`;
    const payload = {
      model: cfg.model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };
    
    console.log('🔗 Making request to:', url);
    console.log('📦 Model:', cfg.model);
    console.log('🔑 Provider:', cfg.provider);
    
    const res = await axios.post(url, payload, { 
      headers: cfg.headers, 
      timeout: timeoutMs 
    });
    
    const content = res.data?.choices?.[0]?.message?.content || '';
    console.log('✅ DeepSeek response received:', content.substring(0, 100) + '...');
    
    return { ok: true, text: content };
  } catch (err) {
    console.error('❌ DeepSeek API Error:', err.response?.data || err.message);
    return { 
      ok: false,
      text: '',
      error: (err?.response?.status === 401)
        ? 'deepseek-unauthorized: Invalid API key or user not found.'
        : (err?.response?.data?.error?.message || err?.message || 'deepseek-error'),
      details: err?.response?.data || undefined
    };
  }
}

module.exports = { generateJSON, getDeepseekConfig };