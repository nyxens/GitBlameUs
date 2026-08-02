/**
 * Centralized API Client Configuration for LifeVault Frontend <-> Backend communication.
 */
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export async function fetchApi(endpoint, options) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText} (${response.status})`);
  }

  return response.json();
}
