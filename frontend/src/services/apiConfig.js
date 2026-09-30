/**
 * Centralized API Client Configuration for LifeVault Frontend <-> Backend communication.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchApi(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('lifevault_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If 401 Unauthorized, attempt a silent token refresh and retry request once
  if (response.status === 401 && !options?._isRetry) {
    try {
      let base = API_URL;
      if (base.endsWith('/api/v1')) base = base.replace('/api/v1', '/api/auth');
      else if (base.endsWith('/api')) base = base.replace('/api', '/api/auth');
      else if (!base.includes('/api/auth')) {
        if (base.endsWith('/')) base = base.slice(0, -1);
        base = `${base}/api/auth`;
      }
      const refreshRes = await fetch(`${base}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        const newToken = refreshData?.accessToken || refreshData?.token;
        if (newToken && typeof window !== 'undefined') {
          localStorage.setItem('lifevault_token', newToken);
          headers['Authorization'] = `Bearer ${newToken}`;
        }
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
          _isRetry: true,
        });
      }
    } catch {
      // Continue to default error handling
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || `API Error: ${response.statusText} (${response.status})`);
  }

  return response.json();
}
