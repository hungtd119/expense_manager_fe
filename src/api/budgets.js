import { apiRequest } from './client';

export async function listBudgets(month) {
  return apiRequest(`/api/budgets?month=${month}`);
}

export async function createBudget(month, payload) {
  return apiRequest(`/api/budgets?month=${month}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateBudget(id, payload) {
  return apiRequest(`/api/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteBudget(id) {
  return apiRequest(`/api/budgets/${id}`, {
    method: 'DELETE'
  });
}
