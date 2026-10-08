import { fetchApi } from './apiConfig.js';

// ── Blood banks (admin: all; staff: own blood bank only) ──
export const getBloodBanks = () => fetchApi('/bloodbanks');

// ── Admin only ──
export const createBloodBank = (bloodBank) =>
  fetchApi('/bloodbanks', { method: 'POST', body: JSON.stringify(bloodBank) });

export const deleteBloodBank = (id) => fetchApi(`/bloodbanks/${id}`, { method: 'DELETE' });
