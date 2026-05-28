export const tokenKey = 'expense_manager_token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://api.sweete.id.vn';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Co loi xay ra.');
  }
  return data;
}
