import { apiRequest } from './client';

export async function listTransactions(month, page, pageSize) {
  let url = `/api/transactions?month=${month}`;
  if (page !== undefined && pageSize !== undefined) {
    url += `&page=${page}&pageSize=${pageSize}`;
  }
  return apiRequest(url);
}

export async function createTransaction(payload) {
  return apiRequest('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateTransaction(id, payload) {
  return apiRequest(`/api/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteTransaction(id) {
  return apiRequest(`/api/transactions/${id}`, {
    method: 'DELETE'
  });
}
