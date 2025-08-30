import axios from 'axios';

export async function fetchCompanyCandidates(companyId: string, token: string) {
  const response = await axios.get(`/api/applications/company/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
