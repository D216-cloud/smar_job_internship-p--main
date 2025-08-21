const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function extractCurrentResumeText(): Promise<{ success: boolean; text?: string; length?: number; error?: string; }>{
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/api/resume/extract-current`, {
    headers: { Authorization: `Bearer ${token || ''}` }
  });
  const data = await res.json();
  return data;
}
