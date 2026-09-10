import { fetchApi } from './apiConfig.js';

export async function getLiveStock() {
  try {
    const res = await fetchApi('/inventory/stock');
    if (res && res.stock) return res.stock;
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock response:', err);
  }
  return [
    { type: 'O-', units: 48, status: 'Critical', expirationDaysAvg: 12 },
    { type: 'O+', units: 210, status: 'Optimal', expirationDaysAvg: 28 },
    { type: 'A+', units: 185, status: 'Optimal', expirationDaysAvg: 22 },
    { type: 'A-', units: 62, status: 'Low', expirationDaysAvg: 15 },
    { type: 'B+', units: 140, status: 'Optimal', expirationDaysAvg: 30 },
    { type: 'B-', units: 35, status: 'Critical', expirationDaysAvg: 9 },
    { type: 'AB+', units: 92, status: 'Optimal', expirationDaysAvg: 24 },
    { type: 'AB-', units: 28, status: 'Critical', expirationDaysAvg: 7 },
  ];
}

export async function getColdChainTelemetry() {
  return {
    vaultId: '#LV-BLOOD-9042',
    mainVaultTemp: 2.4,
    plasmaUnitTemp: -18.2,
    powerBackupHealthPercent: 100,
    syncLatencyMs: 24,
  };
}

export async function getInventoryItems() {
  try {
    const res = await fetchApi('/inventory/items');
    if (res && res.items) return res.items;
  } catch (err) {
    console.warn('API connection unavailable for getInventoryItems, falling back to default:', err);
  }
  return [
    { barcode: 'LV-UNIT-8091', type: 'O-', component: 'PRBC (Packed Red Cells)', units: 12, expiry: '4 Days (FEFO #1)', temp: '2.4°C', status: 'CRITICAL', bloodGroup: 'O-' },
    { barcode: 'LV-UNIT-8092', type: 'O+', component: 'Whole Blood', units: 180, expiry: '28 Days', temp: '2.5°C', status: 'OPTIMAL', bloodGroup: 'O+' },
    { barcode: 'LV-UNIT-8093', type: 'A+', component: 'FFP (Plasma)', units: 65, expiry: '120 Days', temp: '-18.2°C', status: 'OPTIMAL', bloodGroup: 'A+' },
    { barcode: 'LV-UNIT-8094', type: 'A-', component: 'Whole Blood', units: 48, expiry: '14 Days', temp: '2.4°C', status: 'LOW', bloodGroup: 'A-' },
    { barcode: 'LV-UNIT-8095', type: 'B+', component: 'Platelets', units: 140, expiry: '3 Days (FEFO #2)', temp: '22.1°C', status: 'OPTIMAL', bloodGroup: 'B+' },
    { barcode: 'LV-UNIT-8096', type: 'B-', component: 'PRBC', units: 8, expiry: '2 Days (FEFO #1)', temp: '2.4°C', status: 'CRITICAL', bloodGroup: 'B-' },
    { barcode: 'LV-UNIT-8097', type: 'AB+', component: 'Whole Blood', units: 92, expiry: '24 Days', temp: '2.3°C', status: 'OPTIMAL', bloodGroup: 'AB+' },
    { barcode: 'LV-UNIT-8098', type: 'AB-', component: 'FFP (Plasma)', units: 28, expiry: '7 Days', temp: '-18.0°C', status: 'CRITICAL', bloodGroup: 'AB-' },
  ];
}

export async function fulfillInventoryItem(id, details = {}) {
  try {
    return await fetchApi(`/inventory/fulfill/${id}`, {
      method: 'PUT',
      body: JSON.stringify(details),
    });
  } catch (err) {
    console.warn('API connection unavailable for fulfillInventoryItem:', err);
    return {
      success: true,
      message: 'Blood received and inventory fulfilled (mock fallback).',
    };
  }
}

export const inventoryService = {
  getLiveStock,
  getColdChainTelemetry,
  getInventoryItems,
  fulfillInventoryItem,
};
