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
  try {
    return await fetchApi('/seeker/request', {
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
  } catch (err) {
    console.warn('API unavailable for applySeekerRequest, mock fallback:', err);
    return {
      success: true,
      message: 'Blood requisition submitted successfully. Awaiting Admin verification.',
      data: {
        _id: `SR-${Date.now()}`,
        u_id,
        patient_name,
        bloodgroup: bloodgroup || 'O+',
        units: units || 1,
        weight: (units || 1) * 450,
        is_emergency: Boolean(is_emergency),
        target_type: target_type || 'HOSPITAL',
        hospital_id,
        bloodbank_id,
        required_date,
        seeker_notes,
        pincode,
        status: 'NOT_VERIFIED',
        createdAt: new Date().toISOString(),
      },
    };
  }
}

// ── Phase 2: Admin verifies seeker credentials & medical necessity ──
export async function verifySeekerRequest(requestId, { is_approved, verification_notes, rejection_reason }) {
  try {
    return await fetchApi(`/seeker/request/${requestId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ is_approved, verification_notes, rejection_reason }),
    });
  } catch (err) {
    console.warn('API unavailable for verifySeekerRequest, mock fallback:', err);
    return {
      success: true,
      message: `Requisition ${is_approved ? 'verified' : 'rejected'}.`,
      data: { _id: requestId, status: is_approved ? 'VERIFIED' : 'REJECTED' },
    };
  }
}

// ── Phase 3: Accept & schedule appointment / pickup ──
export async function acceptAndScheduleSeekerRequest(requestId, {
  schedule_date,
  schedule_time,
  pickup_venue,
  scheduling_notes,
  allocated_bag_ids,
}) {
  try {
    return await fetchApi(`/seeker/request/${requestId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({
        schedule_date,
        schedule_time,
        pickup_venue,
        scheduling_notes,
        allocated_bag_ids,
      }),
    });
  } catch (err) {
    console.warn('API unavailable for acceptAndScheduleSeekerRequest, mock fallback:', err);
    return {
      success: true,
      message: 'Requisition accepted and pickup scheduled.',
      data: { _id: requestId, status: 'ACCEPTED', schedule_date, schedule_time, pickup_venue },
    };
  }
}

// ── Phase 4: Fulfill blood requisition ──
export async function fulfillSeekerRequest(requestId, details = {}) {
  try {
    return await fetchApi(`/seeker/request/${requestId}/fulfill`, {
      method: 'PUT',
      body: JSON.stringify(details),
    });
  } catch (err) {
    console.warn('API unavailable for fulfillSeekerRequest, mock fallback:', err);
    return {
      success: true,
      message: 'Blood requisition fulfilled! Units dispatched to patient.',
      data: { _id: requestId, status: 'COMPLETED' },
    };
  }
}

// ── Cancel request ──
export async function cancelSeekerRequest(requestId, reason) {
  try {
    return await fetchApi(`/seeker/request/${requestId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  } catch (err) {
    console.warn('API unavailable for cancelSeekerRequest, mock fallback:', err);
    return {
      success: true,
      message: 'Blood request cancelled.',
      data: { _id: requestId, status: 'CANCELLED' },
    };
  }
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

    return result || { success: true, count: 0, requests: [] };
  } catch (err) {
    console.warn('API unavailable for getAllSeekerRequests:', err);
    return { success: false, count: 0, requests: [] };
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
