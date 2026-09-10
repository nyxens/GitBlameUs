/**
 * Centralized API Client Configuration for LifeVault Frontend <-> Backend communication.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || `API Error: ${response.statusText} (${response.status})`);
  }

  return response.json();
}
