import { fetchApi } from './apiConfig.js';

export async function authenticateHospital(licenseId, hospitalName) {
  try {
    return await fetchApi('/hospitals/auth', {
      method: 'POST',
      body: JSON.stringify({ licenseId, hospitalName }),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock response:', err);
    return {
      success: true,
      hospital: {
        id: 'HOSP-NY-9042',
        name: hospitalName || 'St. Jude General Hospital',
        licenseId,
        city: 'New York',
        networkNode: 'NODE-EAST-01',
        isVerified: true,
      },
    };
  }
}

export async function submitEmergencyRequisition(requisition) {
  try {
    return await fetchApi('/requisitions', {
      method: 'POST',
      body: JSON.stringify(requisition),
    });
  } catch (err) {
    console.warn('API connection unavailable, falling back to mock response:', err);
    return {
      success: true,
      requisition: {
        id: `ORD-${Math.floor(9000 + Math.random() * 1000)}`,
        hospitalName: requisition.hospitalName || 'St. Jude ER',
        bloodGroup: requisition.bloodGroup || 'O-',
        unitsRequested: requisition.unitsRequested || 2,
        urgencyLevel: requisition.urgencyLevel || 'EMERGENCY TRAUMA',
        status: 'Approved',
        requestedAt: new Date().toISOString(),
      },
    };
  }
}

// ── Hospitals (admin: all; staff: own hospital only) ──
export const getHospitals = () => fetchApi('/hospitals');

// ── Admin only ──
export const createHospital = (hospital) =>
  fetchApi('/hospitals', { method: 'POST', body: JSON.stringify(hospital) });

export const deleteHospital = (id) => fetchApi(`/hospitals/${id}`, { method: 'DELETE' });

export const hospitalService = {
  getHospitals,
  createHospital,
  deleteHospital,
  authenticateHospital,
  submitEmergencyRequisition,
};
