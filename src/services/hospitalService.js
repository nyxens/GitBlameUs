export const hospitalService = {
  async authenticateHospital(licenseId) {
    return {
      id: 'HOSP-NY-9042',
      name: 'St. Jude General Hospital',
      licenseId,
      city: 'New York',
      networkNode: 'NODE-EAST-01',
      isVerified: true,
    };
  },

  async submitEmergencyRequisition(requisition) {
    return {
      id: `ORD-${Math.floor(9000 + Math.random() * 1000)}`,
      hospitalName: requisition.hospitalName || 'St. Jude ER',
      bloodGroup: requisition.bloodGroup || 'O-',
      unitsRequested: requisition.unitsRequested || 2,
      urgencyLevel: requisition.urgencyLevel || 'EMERGENCY TRAUMA',
      status: 'Approved',
      requestedAt: new Date().toISOString(),
    };
  },
};
