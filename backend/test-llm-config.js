/* Quick test to inspect LLM client configuration without making network calls */
const { getDeepseekConfig } = require('./utils/llmClient');
const cfg = getDeepseekConfig();
console.log('LLM Config:', cfg);
