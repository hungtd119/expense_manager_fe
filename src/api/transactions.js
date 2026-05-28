import { apiRequest } from './client';

export async function listTransactions(month, page, pageSize, filters = {}) {
  let url = `/api/transactions?month=${month}`;
  if (page !== undefined && pageSize !== undefined) {
    url += `&page=${page}&pageSize=${pageSize}`;
  }
  if (filters.type) url += `&type=${filters.type}`;
  if (filters.categoryId) url += `&categoryId=${filters.categoryId}`;
  if (filters.walletId) url += `&walletId=${filters.walletId}`;
  if (filters.q) url += `&q=${encodeURIComponent(filters.q)}`;
  if (filters.minAmount) url += `&minAmount=${filters.minAmount}`;
  if (filters.maxAmount) url += `&maxAmount=${filters.maxAmount}`;
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
