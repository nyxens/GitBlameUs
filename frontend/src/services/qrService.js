import { fetchApi } from './apiConfig.js';

/** Signed QR payload for the logged-in user. */
export const getMyQrPayload = async () => (await fetchApi('/qr/me')).payload;

/** Member details for a scanned code (organization members & master admin only). */
export const resolveQr = async (payload) =>
  (await fetchApi('/qr/resolve', { method: 'POST', body: JSON.stringify({ payload }) })).member;
