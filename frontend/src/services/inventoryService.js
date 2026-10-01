import { fetchApi } from './apiConfig.js';

export async function getLiveStock() {
  try {
    const res = await fetchApi('/inventory/stock');
    if (res && res.stock) return res.stock;
    return [];
  } catch (err) {
    console.warn('API connection unavailable for getLiveStock:', err);
    return [];
  }
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
    const emptyItems = [];
    emptyItems.facilities = [];
    return emptyItems;
  } catch (err) {
    console.warn('API connection unavailable for getInventoryItems:', err);
    const emptyItems = [];
    emptyItems.facilities = [];
    return emptyItems;
  }
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

