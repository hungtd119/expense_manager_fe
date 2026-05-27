import { apiRequest } from './client';

export async function listCategories() {
  return apiRequest('/api/categories');
}

export async function createCategory(payload) {
  return apiRequest('/api/categories', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateCategory(id, payload) {
  return apiRequest(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteCategory(id) {
  return apiRequest(`/api/categories/${id}`, {
    method: 'DELETE'
  });
}

export async function listWallets() {
  return apiRequest('/api/wallets');
}

export async function createWallet(payload) {
  return apiRequest('/api/wallets', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateWallet(id, payload) {
  return apiRequest(`/api/wallets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteWallet(id) {
  return apiRequest(`/api/wallets/${id}`, {
    method: 'DELETE'
  });
}
