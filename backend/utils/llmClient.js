// Load environment variables so this module works when run directly (tests/scripts)
require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');

function getDeepseekConfig(customApiKey = null) {
  // Support using GEMINI_API_KEY as a fallback to DEEPSEEK_API_KEY
  const key = customApiKey || process.env.DEEPSEEK_API_KEY || process.env.GEMINI_API_KEY || '';
  const isOpenRouter = key.startsWith('sk-or-');
  if (!key) return { ok: false, reason: 'missing-key' };
  if (isOpenRouter) {
    return {
      ok: true,
      provider: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      model: process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-r1-0528:free',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
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
  // Normalize baseURL: trim whitespace and remove trailing slash to avoid malformed URLs like
  // 'https://openrouter.ai/api/v1  /chat/completions' which can lead to 405 responses.
  const base = String(cfg.baseURL || '').trim();
  const cleanBase = base.replace(/\s+/g, '');
  const url = `${cleanBase.replace(/\/$/, '')}/chat/completions`;
  const payload = {
    model: cfg.model,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
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
      const status = err?.response?.status;
      const retryAfterHeader = err?.response?.headers?.['retry-after'];
  console.error('❌ DeepSeek API Error:', err.response?.data || err.message);

      // If it's a rate limit or server error, retry with backoff (respect Retry-After if provided)
      const isRetryable = status === 429 || (status >= 500 && status < 600);
      if (attempt < maxAttempts && isRetryable) {
        let delayMs = 500 * Math.pow(2, attempt - 1); // 500ms, 1000ms, 2000ms
        // Respect Retry-After header when present (seconds or HTTP-date)
        if (retryAfterHeader) {
          const ra = parseInt(retryAfterHeader, 10);
          if (!Number.isNaN(ra)) {
            delayMs = ra * 1000;
          }
        }
        // small jitter
        delayMs = Math.min(30000, delayMs + Math.floor(Math.random() * 300));
  console.warn(`⏳ Will retry in ${delayMs}ms (next attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }

      // Non-retryable or out of attempts: return structured error
      let message = err?.response?.data?.error?.message || err?.message || 'deepseek-error';
      // Provide clearer hints for common statuses
      if (status === 401) message = 'authentication-failed';
      if (status === 429) message = 'rate-limited';
      if (status >= 400 && status < 500 && status !== 429) message = 'bad-request';

      return {
        ok: false,
        text: '',
        error: message
      };
    }
  }
}

module.exports = { generateJSON, getDeepseekConfig };