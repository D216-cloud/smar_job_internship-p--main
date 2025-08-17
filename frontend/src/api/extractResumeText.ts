export async function extractCurrentResumeText(): Promise<{ success: boolean; text?: string; length?: number; error?: string; }>{
  const token = localStorage.getItem('token');
  const res = await fetch('/api/resume/extract-current', {
    headers: { Authorization: `Bearer ${token || ''}` }
  });
  const data = await res.json();
  return data;
}
