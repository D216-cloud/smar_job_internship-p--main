const { generateStrictJSON, parseJsonRobust, isConfigured: isGeminiConfigured } = require('./geminiClient');

function buildMatcherPrompt({ resumeText, jobTitle, jobDescription, jobRequirements, filesList }) {
  // Build a deterministic prompt that asks the model to return only JSON with the required fields
  return `System:\nYou are a professional AI recruiter. Compare the provided RESUME and JOB DESCRIPTION and return a single JSON object only (no extra text) with the following fields:\n\n- fitScore (0-100)\n- matched_skills: array of { skill, context }\n- missing_skills: array of strings\n- experience_match: string\n- job_description_match: string\n- improvement_suggestions: array of strings\n- summary: short string\n\nUser Inputs:\nJOB_TITLE: ${jobTitle}\nJOB_DESCRIPTION: ${jobDescription}\nJOB_REQUIREMENTS: ${jobRequirements}\nFILES: ${filesList && filesList.length ? JSON.stringify(filesList) : '[]'}\n\nRESUME:\n${resumeText}\n\nInstructions:\n- Output a valid JSON object exactly following the field names above.\n- For matched_skills include small context (short excerpt) from the resume.\n- Keep fitScore numeric between 0 and 100.\n- If you cannot find evidence, leave arrays empty rather than inventing facts.\n- Do not include any commentary, only the JSON object.\n`;
}

async function analyzeResumeWithLLM(inputs, { timeoutMs = 25000 } = {}) {
  if (!isGeminiConfigured()) return { ok: false, error: 'AI service not configured' };

  const prompt = buildMatcherPrompt(inputs);
  const result = await generateStrictJSON(prompt, { timeoutMs });
  if (!result.ok) return { ok: false, error: result.error || 'generation_failed' };

  // Try to extract JSON from response
  const raw = result.text || '';
  let parsed = null;
  try {
    parsed = parseJsonRobust(raw);
  } catch (err) {
    return { ok: false, error: 'invalid_json', raw };
  }

  return { ok: true, data: parsed };
}

module.exports = { buildMatcherPrompt, analyzeResumeWithLLM };
