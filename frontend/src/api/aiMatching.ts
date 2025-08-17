// Minimal frontend helper to call AI matching endpoint
export async function matchResumeToJob(params: {
  token: string;
  userId: string;
  jobId: string;
  engine?: 'gemini' | 'fallback';
  debug?: boolean;
}) {
  const res = await fetch('/api/ai-matching/match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${params.token}`
    },
    body: JSON.stringify({
      userId: params.userId,
      jobId: params.jobId,
      engine: params.engine || 'gemini',
      outputFormat: 'json-compare',
      debug: params.debug || false
    })
  });
  if (!res.ok) throw new Error(`Match failed: ${res.status}`);
  return res.json();
}
