const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro';

let genAI = null;
if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (e) {
    console.warn('Gemini initialization error:', e?.message || e);
    genAI = null;
  }
}

function isConfigured() {
  return Boolean(GEMINI_API_KEY && genAI);
}

/**
 * Generate JSON-only response using a strict prompt. Returns { ok, text, error }
 */
async function generateStrictJSON(prompt, opts = {}) {
  if (!isConfigured()) return { ok: false, text: '', error: 'gemini-not-configured' };
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs || 15000);
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }], signal: controller.signal });
    clearTimeout(timeout);
    const response = await result.response;
    return { ok: true, text: response.text() };
  } catch (err) {
    return { ok: false, text: '', error: err?.message || 'gemini-error' };
  }
}

/** Robust JSON parse that strips code fences and finds first object */
function parseJsonRobust(text) {
  const tryParsers = [
    (s) => JSON.parse(s.trim()),
    (s) => JSON.parse(s.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim()),
    (s) => {
      const m = s.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('no-object');
      return JSON.parse(m[0]);
    }
  ];
  let lastErr = null;
  for (const p of tryParsers) {
    try { return p(text); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('parse-failed');
}

module.exports = {
  isConfigured,
  generateStrictJSON,
  parseJsonRobust,
  GEMINI_MODEL
};
