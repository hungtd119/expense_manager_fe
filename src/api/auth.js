import { apiRequest } from './client';

export async function login(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function register(name, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
}

export async function logout() {
  return apiRequest('/api/auth/logout', { method: 'POST' });
}

export async function me() {
  return apiRequest('/api/me');
}
