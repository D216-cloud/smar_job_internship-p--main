import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function fetchCompanyCandidates(companyId: string, token: string) {
  const response = await axios.get(`${API_BASE_URL}/api/applications/company/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
