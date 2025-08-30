const { generateJSON, getDeepseekConfig } = require('./utils/llmClient');

(async () => {
  const cfg = getDeepseekConfig();
  console.log('Config ok:', cfg.ok, 'provider:', cfg.provider);
  const prompt = 'Please respond with a short JSON: {"status":"ok","time":123}';
  const result = await generateJSON(prompt, { timeoutMs: 10000 });
  console.log('Result:', result);
})();
