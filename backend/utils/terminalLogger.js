// Simple utility to generate strict terminal-style logs for AI resume matching
function formatSeconds(ms) {
  return (ms / 1000).toFixed(3);
}

function generateTerminalLog({ resume_source, job_title, job_id, steps = [], results = {} }) {
  const lines = [];
  lines.push('START: AI Resume Matching');

  const timings = [];
  let totalMs = 0;

  for (const step of steps) {
    lines.push(`STEP START: ${step}`);

    // Simulate plausible durations (in ms) based on step name
    let ms = 0;
    switch (step) {
      case 'fetch_pdf':
        // network fetch
        ms = 80 + Math.floor(Math.random() * 300);
        lines.push(`FETCH: ${resume_source}`);
        break;
      case 'extract_text':
        ms = 300 + Math.floor(Math.random() * 1200);
        break;
      case 'call_deepseek':
      case 'call_gemini':
      case 'call_llm':
        ms = 500 + Math.floor(Math.random() * 2500);
        break;
      case 'score':
        ms = 20 + Math.floor(Math.random() * 80);
        break;
      case 'render':
        ms = 10 + Math.floor(Math.random() * 50);
        break;
      default:
        ms = 50 + Math.floor(Math.random() * 200);
        break;
    }

    // small jitter for realism
    ms += Math.floor(Math.random() * 30);

    totalMs += ms;
    timings.push({ step, ms });
    lines.push(`STEP END: ${step} — duration: ${formatSeconds(ms)}s`);
  }

  // Results lines
  const fit = Number(results.fitScore ?? results.score ?? results.matchScore ?? 0) || 0;
  const matched = Array.isArray(results.matchedSkills) ? results.matchedSkills : Array.isArray(results.matched) ? results.matched : [];
  const missing = Array.isArray(results.missingSkills) ? results.missingSkills : Array.isArray(results.missing) ? results.missing : [];

  lines.push(`RESULT: fitScore=${fit}`);
  lines.push(`RESULT: matchedSkills=${matched.length ? matched.join(',') : 'NONE'}`);
  lines.push(`RESULT: missingSkills=${missing.length ? missing.join(',') : 'NONE'}`);

  lines.push(`TOTAL: ${formatSeconds(totalMs)}s`);
  return lines.join('\n');
}

module.exports = { generateTerminalLog };
