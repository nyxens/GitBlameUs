import { fetchApi } from './apiConfig.js';

// ── Query: Audit ledger (donation intakes + allotments) with summary metrics ──
export async function getHistory() {
  return fetchApi('/history');
}

export default { getHistory };
