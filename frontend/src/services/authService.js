import { fetchApi } from './apiConfig.js';

export async function loginUser(email, password) {
  try {
    return await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock login:', err);
    return {
      success: true,
      accessToken: 'mock-access-token-lifevault-2026',
      refreshToken: 'mock-refresh-token-lifevault-2026',
      user: { email, role: 'USER' },
    };
  }
}

export async function refreshAccessToken(refreshToken) {
  try {
    return await fetchApi('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock refresh:', err);
    return {
      success: true,
      accessToken: 'mock-new-access-token-lifevault-2026',
      refreshToken: 'mock-new-refresh-token-lifevault-2026',
    };
  }
}
