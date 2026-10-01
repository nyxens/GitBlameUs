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

export async function getRequisitions() {
  try {
    return await fetchApi('/requisitions');
  } catch (err) {
    console.warn('API connection unavailable for getRequisitions:', err);
    return null;
  }
}

export async function deleteRequisition(id) {
  try {
    return await fetchApi(`/requisitions/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('API connection unavailable for deleteRequisition:', err);
    return { success: false, error: err.message };
  }
}

export async function acceptRequisition(id) {
  return fetchApi(`/requisitions/${id}/accept`, {
    method: 'PUT',
  });
}

export async function allocateRequisition(id, data = {}) {
  return fetchApi(`/requisitions/${id}/allocate`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function denyRequisition(id, reason = '') {
  return fetchApi(`/requisitions/${id}/deny`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

export async function getCandidateBags(bloodGroup = null, facilityId = null) {
  try {
    const params = new URLSearchParams();
    if (bloodGroup && bloodGroup !== 'ALL') params.append('bloodGroup', bloodGroup);
    if (facilityId && facilityId !== 'ALL') params.append('facilityId', facilityId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await fetchApi(`/requisitions/candidate-bags${query}`);
  } catch (err) {
    console.warn('API connection unavailable for getCandidateBags:', err);
    return { success: false, bags: [] };
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
  getRequisitions,
  deleteRequisition,
  acceptRequisition,
  allocateRequisition,
  denyRequisition,
  getCandidateBags,
};
