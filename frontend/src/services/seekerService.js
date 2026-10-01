import { fetchApi } from './apiConfig.js';

/**
 * =========================================================================
 * SEEKER SERVICE — Frontend API client for the Seeker Blood Request workflow
 * =========================================================================
 * Maps to backend endpoints: /api/v1/seeker/*
 */

// ── Phase 1: Submit a new blood requisition ──
export async function applySeekerRequest({
  u_id,
  patient_name,
  bloodgroup,
  units = 1,
  weight,
  is_emergency = false,
  target_type,
  hospital_id,
  bloodbank_id,
  required_date,
  seeker_notes,
  pincode,
}) {
  return fetchApi('/seeker/request', {
    method: 'POST',
    body: JSON.stringify({
      u_id,
      patient_name,
      bloodgroup,
      units,
      weight,
      is_emergency,
      target_type,
      hospital_id,
      bloodbank_id,
      required_date,
      seeker_notes,
      pincode,
    }),
  });
}

// ── Phase 2: Admin verifies seeker credentials & medical necessity ──
export async function verifySeekerRequest(requestId, { is_approved, verification_notes, rejection_reason }) {
  return fetchApi(`/seeker/request/${requestId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ is_approved, verification_notes, rejection_reason }),
  });
}

// ── Phase 3: Accept & schedule appointment / pickup ──
export async function acceptAndScheduleSeekerRequest(requestId, {
  schedule_date,
  schedule_time,
  pickup_venue,
  scheduling_notes,
  allocated_bag_ids,
}) {
  return fetchApi(`/seeker/request/${requestId}/schedule`, {
    method: 'PUT',
    body: JSON.stringify({
      schedule_date,
      schedule_time,
      pickup_venue,
      scheduling_notes,
      allocated_bag_ids,
    }),
  });
}

// ── Phase 4: Fulfill blood requisition ──
export async function fulfillSeekerRequest(requestId, details = {}) {
  return fetchApi(`/seeker/request/${requestId}/fulfill`, {
    method: 'PUT',
    body: JSON.stringify(details),
  });
}

// ── Cancel request ──
export async function cancelSeekerRequest(requestId, reason) {
  return fetchApi(`/seeker/request/${requestId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

// ── Query: Get single request details ──
export async function getRequestDetails(requestId) {
  try {
    return await fetchApi(`/seeker/request/${requestId}`);
  } catch (err) {
    console.warn('API unavailable for getRequestDetails:', err);
    return { success: false, error: err.message };
  }
}

// ── Query: Get my requests (for logged-in seeker) ──
export async function getMySeekerRequests(userId) {
  try {
    const queryParam = userId ? `?u_id=${userId}` : '';
    return await fetchApi(`/seeker/my-requests${queryParam}`);
  } catch (err) {
    console.warn('API unavailable for getMySeekerRequests, mock fallback:', err);
    return {
      success: true,
      count: 0,
      data: [],
    };
  }
}

// ── Query: Get pending admin verifications ──
export async function getPendingVerifications() {
  try {
    return await fetchApi('/seeker/admin/pending');
  } catch (err) {
    console.warn('API unavailable for getPendingVerifications, mock fallback:', err);
    return { success: true, count: 0, data: [] };
  }
}

// ── Query: Get requests for a hospital ──
export async function getHospitalSeekerRequests(hospitalId, status) {
  try {
    const query = status ? `?status=${status}` : '';
    return await fetchApi(`/seeker/hospital/${hospitalId}${query}`);
  } catch (err) {
    console.warn('API unavailable for getHospitalSeekerRequests:', err);
    return { success: true, count: 0, data: [] };
  }
}

// ── Query: Get requests for a blood bank ──
export async function getBloodBankSeekerRequests(bloodbankId, status) {
  try {
    const query = status ? `?status=${status}` : '';
    return await fetchApi(`/seeker/bloodbank/${bloodbankId}${query}`);
  } catch (err) {
    console.warn('API unavailable for getBloodBankSeekerRequests:', err);
    return { success: true, count: 0, data: [] };
  }
}

// ── Query: Get all requests with filters ──
export async function getAllSeekerRequests({ status, target_type, bloodgroup, is_emergency, limit, skip } = {}) {
  const MOCK_DATA = getMockSeekerRequests();

  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (target_type) params.set('target_type', target_type);
    if (bloodgroup) params.set('bloodgroup', bloodgroup);
    if (is_emergency !== undefined) params.set('is_emergency', String(is_emergency));
    if (limit) params.set('limit', String(limit));
    if (skip) params.set('skip', String(skip));
    const queryString = params.toString();
    const result = await fetchApi(`/seeker/requests${queryString ? `?${queryString}` : ''}`);

    const hasRealData = (result?.requests?.length > 0) || (result?.data?.length > 0);
    if (hasRealData) return result;

    console.info('[SeekerService] DB is empty — using demo data for UI preview.');
    return MOCK_DATA;
  } catch (err) {
    console.warn('API unavailable for getAllSeekerRequests, mock fallback:', err);
    return MOCK_DATA;
  }
}

// ── Query: Get logged-in seeker's profile for form pre-fill ──
export async function getSeekerProfile() {
  try {
    return await fetchApi('/seeker/seeker-profile');
  } catch (err) {
    console.warn('getSeekerProfile failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Query: Get current active (non-terminal) request for logged-in seeker ──
export async function getActiveRequest() {
  try {
    return await fetchApi('/seeker/active-request');
  } catch (err) {
    console.warn('getActiveRequest failed:', err.message);
    return { success: false, data: null };
  }
}

// ── Query: Find nearby hospitals & blood banks by pincode or lat/lng with stock ──
export async function getNearbyInstitutions({ pincode, lat, lng, type = 'ALL', radius = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (lat != null && lng != null) {
      params.set('lat', String(lat));
      params.set('lng', String(lng));
    } else {
      params.set('pincode', pincode);
    }
    if (type && type !== 'ALL') params.set('type', type);
    if (radius) params.set('radius', String(radius));
    return await fetchApi(`/seeker/nearby?${params.toString()}`);
  } catch (err) {
    console.warn('getNearbyInstitutions failed:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Demo / preview mock data — used when the database is empty or backend is unreachable.
 */
function getMockSeekerRequests() {
  return {
    success: true,
    total: 4,
    count: 4,
    requests: [
      {
        _id: 'SR-MOCK-001',
        u_id: { _id: 'U-101', name: 'David Miller', username: 'dmiller', email: 'dmiller@example.com', bloodgroup: 'O-', phone: '+1 (555) 234-8899', gender: 'Male' },
        patient_name: 'David Miller',
        bloodgroup: 'O-',
        units: 2,
        weight: 900,
        is_emergency: true,
        target_type: 'HOSPITAL',
        hospital_id: { _id: 'H-001', hos_name: 'Metro General Hospital', pincode: '10001' },
        status: 'ACCEPTED',
        schedule_date: '2026-10-01T00:00:00.000Z',
        schedule_time: '10:15 AM',
        pickup_venue: 'Emergency Trauma Desk A',
        scheduling_notes: 'Priority emergency dispatch confirmed.',
        createdAt: '2026-09-28T10:15:00.000Z',
      },
      {
        _id: 'SR-MOCK-002',
        u_id: { _id: 'U-102', name: 'Sophia Lin', username: 'slin', email: 'sophia@example.com', bloodgroup: 'A+', phone: '+1 (555) 443-1289', gender: 'Female' },
        patient_name: 'Sophia Lin',
        bloodgroup: 'A+',
        units: 1,
        weight: 450,
        is_emergency: false,
        target_type: 'BLOOD_BANK',
        bloodbank_id: { _id: 'BB-001', bank_name: 'City Central Blood Bank', pincode: '10014' },
        status: 'VERIFIED',
        verification_notes: 'Cardiology surgery requirement verified.',
        required_date: '2026-10-05T00:00:00.000Z',
        createdAt: '2026-09-27T09:30:00.000Z',
      },
    ],
  };
}

export const seekerService = {
  applySeekerRequest,
  verifySeekerRequest,
  acceptAndScheduleSeekerRequest,
  fulfillSeekerRequest,
  cancelSeekerRequest,
  getRequestDetails,
  getMySeekerRequests,
  getPendingVerifications,
  getHospitalSeekerRequests,
  getBloodBankSeekerRequests,
  getAllSeekerRequests,
  getSeekerProfile,
  getActiveRequest,
  getNearbyInstitutions,
};

export default seekerService;
