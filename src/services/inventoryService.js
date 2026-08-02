export const inventoryService = {
  async getLiveStock() {
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
  },

  async getColdChainTelemetry() {
    return {
      vaultId: '#LV-BLOOD-9042',
      mainVaultTemp: 2.4,
      plasmaUnitTemp: -18.2,
      powerBackupHealthPercent: 100,
      syncLatencyMs: 24,
    };
  },
};
