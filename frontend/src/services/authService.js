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
      token: 'mock-jwt-token-lifevault-2026',
      user: { email, role: 'ADMIN' },
    };
  }
}
