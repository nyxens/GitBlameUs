import { fetchApi } from './apiConfig.js';

/**
 * =========================================================================
 * GIVER SERVICE — Frontend API client for the Giver/Donor Request workflow
 * =========================================================================
 * Maps to backend endpoints:  /api/v1/giver/*
 */

// ── Phase 1: Submit a new donation request ──
export async function applyDonationRequest({ u_id, target_type, hospital_id, bloodbank_id, preferred_date, donor_notes }) {
  return fetchApi('/giver/request', {
    method: 'POST',
    body: JSON.stringify({ u_id, target_type, hospital_id, bloodbank_id, preferred_date, donor_notes }),
  });
}

// ── Phase 2: Admin verifies donor credentials ──
export async function verifyDonationRequest(requestId, { is_approved, verification_notes, rejection_reason }) {
  return fetchApi(`/giver/request/${requestId}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ is_approved, verification_notes, rejection_reason }),
  });
}

// ── Accept donation request (automatically creates unfulfilled inventory BloodBag entry) ──
export async function acceptDonationRequest(requestId, details = {}) {
  return fetchApi(`/giver/request/${requestId}/accept`, {
    method: 'PUT',
    body: JSON.stringify(details),
  });
}

// ── Deny donation request ──
export async function denyDonationRequest(requestId, reason = 'Donation request denied.') {
  return fetchApi(`/giver/request/${requestId}/deny`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

// ── Fulfill donation receipt (BBMS receives the blood -> inventory entry fulfilled) ──
export async function fulfillDonationReceipt(requestIdOrBagId, details = {}) {
  return fetchApi(`/giver/request/${requestIdOrBagId}/fulfill`, {
    method: 'PUT',
    body: JSON.stringify(details),
  });
}

// ── Phase 3: Accept & schedule appointment ──
export async function acceptAndScheduleDonation(requestId, { appointment_date, appointment_time, appointment_venue, scheduling_notes }) {
  return fetchApi(`/giver/request/${requestId}/schedule`, {
    method: 'PUT',
    body: JSON.stringify({ appointment_date, appointment_time, appointment_venue, scheduling_notes }),
  });
}

// ── Phase 4: Complete donation ──
export async function completeDonation(requestId, { staff_id, haemoglobin, pressure, volume_donated_ml }) {
  return fetchApi(`/giver/request/${requestId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ staff_id, haemoglobin, pressure, volume_donated_ml }),
  });
}

// ── Cancel request ──
export async function cancelDonationRequest(requestId, reason) {
  return fetchApi(`/giver/request/${requestId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
}

// ── Query: Get single request details ──
export async function getRequestDetails(requestId) {
  try {
    return await fetchApi(`/giver/request/${requestId}`);
  } catch (err) {
    console.warn('API unavailable for getRequestDetails:', err);
    return { success: false, error: err.message };
  }
}

// ── Query: Get my requests (for logged-in donor) ──
export async function getMyGiverRequests(userId) {
  try {
    const queryParam = userId ? `?u_id=${userId}` : '';
    return await fetchApi(`/giver/my-requests${queryParam}`);
  } catch (err) {
    console.warn('API unavailable for getMyGiverRequests, mock fallback:', err);
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
    return await fetchApi('/giver/admin/pending');
  } catch (err) {
    console.warn('API unavailable for getPendingVerifications, mock fallback:', err);
    return { success: true, count: 0, data: [] };
  }
}

// ── Query: Get requests for a hospital ──
export async function getHospitalGiverRequests(hospitalId, status) {
  try {
    const query = status ? `?status=${status}` : '';
    return await fetchApi(`/giver/hospital/${hospitalId}${query}`);
  } catch (err) {
    console.warn('API unavailable for getHospitalGiverRequests:', err);
    return { success: true, count: 0, data: [] };
  }
}

// ── Query: Get all requests with filters ──
export async function getAllGiverRequests({ status, target_type, limit, skip } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (target_type) params.set('target_type', target_type);
    if (limit) params.set('limit', String(limit));
    if (skip) params.set('skip', String(skip));
    const queryString = params.toString();
    const result = await fetchApi(`/giver/requests${queryString ? `?${queryString}` : ''}`);

    return result || { success: true, count: 0, requests: [] };
  } catch (err) {
    console.warn('API unavailable for getAllGiverRequests:', err);
    return { success: false, count: 0, requests: [] };
  }
}


export const giverService = {
  applyDonationRequest,
  verifyDonationRequest,
  acceptAndScheduleDonation,
  acceptDonationRequest,
  denyDonationRequest,
  fulfillDonationReceipt,
  completeDonation,
  cancelDonationRequest,
  getRequestDetails,
  getMyGiverRequests,
  getPendingVerifications,
  getHospitalGiverRequests,
  getAllGiverRequests,
  getDonorProfile,
  getActiveRequest,
  getNearbyInstitutions,
};

// ── Query: Get logged-in donor's profile for form pre-fill ──
export async function getDonorProfile() {
  try {
    return await fetchApi('/giver/donor-profile');
  } catch (err) {
    console.warn('getDonorProfile failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Query: Get current active (non-terminal) request for logged-in donor ──
export async function getActiveRequest() {
  try {
    return await fetchApi('/giver/active-request');
  } catch (err) {
    console.warn('getActiveRequest failed:', err.message);
    return { success: false, data: null };
  }
}

// ── Query: Find nearby hospitals & blood banks by pincode ──
export async function getNearbyInstitutions({ pincode, lat, lng, type = 'ALL', radius = '' } = {}) {
  try {
    // Location mode (lat/lng) sorts by real distance in km; otherwise pincode proximity.
    const params = new URLSearchParams();
    if (lat != null && lng != null) {
      params.set('lat', String(lat));
      params.set('lng', String(lng));
    } else {
      params.set('pincode', pincode);
    }
    if (type && type !== 'ALL') params.set('type', type);
    if (radius) params.set('radius', String(radius));
    return await fetchApi(`/giver/nearby?${params.toString()}`);
  } catch (err) {
    console.warn('getNearbyInstitutions failed:', err.message);
    return { success: false, error: err.message, data: [] };
  }
}
