import { apiRequest } from './client';

export async function listRecurringTransactions() {
  return apiRequest('/api/recurring-transactions');
}

export async function createRecurringTransaction(payload) {
  return apiRequest('/api/recurring-transactions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateRecurringTransaction(id, payload) {
  return apiRequest(`/api/recurring-transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteRecurringTransaction(id) {
  return apiRequest(`/api/recurring-transactions/${id}`, {
    method: 'DELETE'
  });
}
