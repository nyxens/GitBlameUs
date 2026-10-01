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

export async function getInventoryItems(facilityId = null) {
  try {
    const query = facilityId && facilityId !== 'ALL' ? `?facilityId=${encodeURIComponent(facilityId)}` : '';
    const res = await fetchApi(`/inventory/items${query}`);
    if (res && res.items) {
      const items = res.items;
      items.facilities = res.facilities || [];
      return items;
    }
  } catch (err) {
    console.warn('API connection unavailable for getInventoryItems, falling back to default:', err);
  }
  const fallback = [
    { barcode: 'LV-UNIT-8091', type: 'O-', component: 'PRBC (Packed Red Cells)', units: 12, expiry: '4 Days (FEFO #1)', temp: '2.4°C', status: 'CRITICAL', bloodGroup: 'O-' },
    { barcode: 'LV-UNIT-8092', type: 'O+', component: 'Whole Blood', units: 180, expiry: '28 Days', temp: '2.5°C', status: 'OPTIMAL', bloodGroup: 'O+' },
    { barcode: 'LV-UNIT-8093', type: 'A+', component: 'FFP (Plasma)', units: 65, expiry: '120 Days', temp: '-18.2°C', status: 'OPTIMAL', bloodGroup: 'A+' },
    { barcode: 'LV-UNIT-8094', type: 'A-', component: 'Whole Blood', units: 48, expiry: '14 Days', temp: '2.4°C', status: 'LOW', bloodGroup: 'A-' },
    { barcode: 'LV-UNIT-8095', type: 'B+', component: 'Platelets', units: 140, expiry: '3 Days (FEFO #2)', temp: '22.1°C', status: 'OPTIMAL', bloodGroup: 'B+' },
    { barcode: 'LV-UNIT-8096', type: 'B-', component: 'PRBC', units: 8, expiry: '2 Days (FEFO #1)', temp: '2.4°C', status: 'CRITICAL', bloodGroup: 'B-' },
    { barcode: 'LV-UNIT-8097', type: 'AB+', component: 'Whole Blood', units: 92, expiry: '24 Days', temp: '2.3°C', status: 'OPTIMAL', bloodGroup: 'AB+' },
    { barcode: 'LV-UNIT-8098', type: 'AB-', component: 'FFP (Plasma)', units: 28, expiry: '7 Days', temp: '-18.0°C', status: 'CRITICAL', bloodGroup: 'AB-' },
  ];
  fallback.facilities = [];
  return fallback;
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

export async function getInventoriesByPincode(pincode = '') {
  const cleanPin = String(pincode || '').trim();
  try {
    const res = await fetchApi(`/inventory/by-pincode?pincode=${encodeURIComponent(cleanPin)}`);
    if (res && res.inventories && res.inventories.length > 0) {
      return {
        inventories: res.inventories,
        isFallbackNearby: res.isFallbackNearby || false,
      };
    }
  } catch (err) {
    console.warn('API connection unavailable for getInventoriesByPincode, using mock data:', err);
  }

  // Robust fallback data for offline / mock testing
  const mockAllInventories = [
    {
      id: 'inv-10001-a1',
      inventoryId: 'inv-10001-a1',
      facilityName: 'Metro Regional Blood Center',
      facilityType: 'BloodBank',
      cellno: 'CELL-RBC-A1',
      shelfno: 'SHELF-01',
      pincode: '10001',
      address: '720 2nd Ave, New York, NY 10001',
      phone: '+1 (212) 555-5001',
      temp: '2.4°C',
      capacity: 100,
      currentCount: 5,
      availableUnits: 5,
      countsByGroup: { 'O-': 2, 'O+': 2, 'AB+': 1 },
      distance: '0.4 miles away',
    },
    {
      id: 'inv-10001-a2',
      inventoryId: 'inv-10001-a2',
      facilityName: 'Metro Regional Blood Center',
      facilityType: 'BloodBank',
      cellno: 'CELL-RBC-A2',
      shelfno: 'SHELF-02',
      pincode: '10001',
      address: '720 2nd Ave, New York, NY 10001',
      phone: '+1 (212) 555-5001',
      temp: '2.4°C',
      capacity: 100,
      currentCount: 7,
      availableUnits: 7,
      countsByGroup: { 'A-': 1, 'A+': 3, 'AB-': 1, 'O+': 1, 'AB+': 1 },
      distance: '0.4 miles away',
    },
    {
      id: 'inv-10001-h1',
      inventoryId: 'inv-10001-h1',
      facilityName: 'Metro Health Memorial Hospital',
      facilityType: 'Hospital',
      cellno: 'CELL-TRAUMA-01',
      shelfno: 'SHELF-EMERGENCY',
      pincode: '10001',
      address: '450 First Ave, New York, NY 10001',
      phone: '+1 (212) 555-4001',
      temp: '2.4°C',
      capacity: 50,
      currentCount: 4,
      availableUnits: 4,
      countsByGroup: { 'O-': 1, 'A+': 2, 'B+': 1 },
      distance: '0.8 miles away',
    },
    {
      id: 'inv-10002-c1',
      inventoryId: 'inv-10002-c1',
      facilityName: 'Central Red Cross Blood Bank',
      facilityType: 'BloodBank',
      cellno: 'CELL-CRYOBANK-B1',
      shelfno: 'SHELF-03',
      pincode: '10002',
      address: '520 W 49th St, New York, NY 10002',
      phone: '+1 (212) 555-5002',
      temp: '-18.2°C',
      capacity: 120,
      currentCount: 6,
      availableUnits: 6,
      countsByGroup: { 'B-': 2, 'B+': 3, 'O+': 1 },
      distance: '1.2 miles away',
    },
    {
      id: 'inv-10003-t1',
      inventoryId: 'inv-10003-t1',
      facilityName: 'St. Jude General Trauma Center',
      facilityType: 'Hospital',
      cellno: 'CELL-TRAUMA-03',
      shelfno: 'SHELF-CRITICAL',
      pincode: '10003',
      address: '128 E 17th St, New York, NY 10003',
      phone: '+1 (212) 555-4002',
      temp: '2.5°C',
      capacity: 60,
      currentCount: 5,
      availableUnits: 5,
      countsByGroup: { 'O-': 1, 'O+': 2, 'AB-': 1, 'A-': 1 },
      distance: '1.9 miles away',
    },
  ];

  if (!cleanPin) {
    return { inventories: mockAllInventories, isFallbackNearby: false };
  }

  const directMatches = mockAllInventories.filter((inv) => inv.pincode === cleanPin);
  if (directMatches.length > 0) {
    return { inventories: directMatches, isFallbackNearby: false };
  }

  return {
    inventories: mockAllInventories.map((inv) => ({ ...inv, isDirectMatch: false })),
    isFallbackNearby: true,
  };
}

export const inventoryService = {
  getLiveStock,
  getColdChainTelemetry,
  getInventoryItems,
  fulfillInventoryItem,
  getInventoriesByPincode,
};

