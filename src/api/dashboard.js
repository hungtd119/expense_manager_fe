import { apiRequest } from './client';

export async function getDashboard(month) {
  return apiRequest(`/api/dashboard?month=${month}`);
}
