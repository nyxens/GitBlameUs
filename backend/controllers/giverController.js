import * as giverService from '../services/giverService.js';

/**
 * =======================================================================================
 * GIVER CONTROLLER
 * =======================================================================================
 * Handles incoming HTTP requests and responses for the donation workflow.
 * Delegates all database queries and mutations to giverService.js.
 * 
 * PHASES:
 * 1. applyDonationRequest      -> Donor applies for donation (status: NOT_VERIFIED)
 * 2. verifyDonationRequest     -> Admin verifies credentials (status: VERIFIED / REJECTED)
 * 3. acceptAndScheduleDonation -> Hospital accepts & schedules appointment (status: ACCEPTED)
 * 4. completeDonation          -> Hospital completes donation & creates BloodBag (status: COMPLETED)
 * 5. cancelDonationRequest     -> Donor cancels request (status: CANCELLED)
 * =======================================================================================
 */

/**
 * PHASE 1: Donor applies to donate blood
 * POST /api/v1/giver/request
 */
export async function applyDonationRequest(req, res) {
  try {
    const {
      u_id,
      target_type,
      hospital_id,
      bloodbank_id,
      preferred_date,
      donor_notes,
    } = req.body;

    // Use authenticated user ID from JWT middleware if available, fallback to body
    const donorId = req.user?.id || req.user?._id || req.user?.sub || u_id;

    if (!donorId) {
      return res.status(400).json({
        success: false,
        error: 'Donor user ID is required. Please login or provide u_id.',
      });
    }

    const request = await giverService.createDonationRequest({
      u_id: donorId,
      target_type: target_type || 'HOSPITAL',
      hospital_id,
      bloodbank_id,
      preferred_date,
      donor_notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Blood donation request submitted successfully. Awaiting Admin verification.',
      data: request,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * PHASE 2: Admin reviews & verifies donor credentials
 * PUT /api/v1/giver/request/:id/verify
 */
export async function verifyDonationRequest(req, res) {
  try {
    const { id } = req.params;
    const { is_approved = true, verification_notes, rejection_reason } = req.body;

    // Admin ID from auth token or body
    const adminId = req.user?.id || req.user?._id || req.user?.sub || req.body.admin_id;

    const updatedRequest = await giverService.verifyDonationRequest(id, {
      admin_id: adminId,
      is_approved: is_approved === true || is_approved === 'true',
      verification_notes,
      rejection_reason,
    });

    const actionText = updatedRequest.status === 'VERIFIED' ? 'verified' : 'rejected';

    return res.status(200).json({
      success: true,
      message: `Donation request successfully ${actionText} by Admin.`,
      data: updatedRequest,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * PHASE 3: Hospital or Blood Bank accepts verified request and schedules appointment
 * PUT /api/v1/giver/request/:id/schedule
 */
export async function acceptAndScheduleDonation(req, res) {
  try {
    const { id } = req.params;
    const {
      appointment_date,
      appointment_time,
      appointment_venue,
      scheduling_notes,
      institution_id,
    } = req.body;

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: 'Both appointment_date and appointment_time are required to schedule the donation.',
      });
    }

    const scheduledRequest = await giverService.acceptAndScheduleRequest(id, {
      institution_id: req.user?.institutionId || institution_id,
      appointment_date,
      appointment_time,
      appointment_venue,
      scheduling_notes,
    });

    return res.status(200).json({
      success: true,
      message: 'Donation request accepted and appointment scheduled successfully.',
      data: scheduledRequest,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * PHASE 4: Hospital / Staff marks donation as complete & creates BloodBag in inventory
 * POST /api/v1/giver/request/:id/complete
 */
export async function completeDonation(req, res) {
  try {
    const { id } = req.params;
    const {
      staff_id,
      haemoglobin,
      pressure,
      volume_donated_ml,
      inventory_id,
      expiry_days,
    } = req.body;

    // Resolve staff reference from authenticated token or request payload
    const staffId = req.user?.staffId || staff_id;

    const result = await giverService.completeDonation(id, {
      staff_id: staffId,
      haemoglobin: haemoglobin ? Number(haemoglobin) : 13.5,
      pressure: pressure || '120/80 mmHg',
      volume_donated_ml: volume_donated_ml ? Number(volume_donated_ml) : 450,
      inventory_id,
      expiry_days: expiry_days ? Number(expiry_days) : 35,
    });

    return res.status(200).json({
      success: true,
      message: 'Donation successfully completed! New BloodBag added to inventory.',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * Cancel a donation request
 * PUT /api/v1/giver/request/:id/cancel
 */
export async function cancelDonationRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id || req.user?._id || req.body.u_id;

    const cancelledRequest = await giverService.cancelDonationRequest(id, {
      user_id: userId,
      reason: reason || 'Cancelled by donor.',
    });

    return res.status(200).json({
      success: true,
      message: 'Donation request cancelled successfully.',
      data: cancelledRequest,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Get single donation request by ID
 * GET /api/v1/giver/request/:id
 */
export async function getRequestDetails(req, res) {
  try {
    const { id } = req.params;
    const request = await giverService.getDonationRequestById(id);
    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Get all donation requests submitted by the logged-in donor
 * GET /api/v1/giver/my-requests
 */
export async function getMyRequests(req, res) {
  try {
    const userId = req.user?.id || req.user?._id || req.query.u_id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Donor user ID is required. Please login or pass u_id in query.',
      });
    }

    const requests = await giverService.getRequestsByDonor(userId);
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Get requests awaiting Admin credential verification
 * GET /api/v1/giver/admin/pending
 */
export async function getPendingAdminVerifications(_req, res) {
  try {
    const requests = await giverService.getRequestsPendingVerification();
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Get requests for a specific Hospital dashboard
 * GET /api/v1/giver/hospital/:hospitalId
 */
export async function getHospitalRequests(req, res) {
  try {
    const { hospitalId } = req.params;
    const { status } = req.query;

    const requests = await giverService.getRequestsForHospital(hospitalId, { status });
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Get requests for a specific Blood Bank dashboard
 * GET /api/v1/giver/bloodbank/:bloodbankId
 */
export async function getBloodBankRequests(req, res) {
  try {
    const { bloodbankId } = req.params;
    const { status } = req.query;

    const requests = await giverService.getRequestsForBloodBank(bloodbankId, { status });
    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: List all donation requests with optional status filtering and pagination
 * GET /api/v1/giver/requests
 */
export async function getAllRequests(req, res) {
  try {
    const { status, target_type, limit, skip } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (target_type) filter.target_type = target_type;

    const result = await giverService.getAllDonationRequests(filter, { limit, skip });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * Accept donation request & automatically create unfulfilled inventory BloodBag entry
 * PUT /api/v1/giver/request/:id/accept
 */
export async function acceptDonationRequest(req, res) {
  try {
    const { id } = req.params;
    const {
      appointment_date,
      appointment_time,
      appointment_venue,
      scheduling_notes,
      staff_id,
    } = req.body || {};

    const adminId = req.user?.id || req.user?._id || req.user?.sub || req.body?.admin_id;

    const result = await giverService.acceptDonationRequest(id, {
      admin_id: adminId,
      staff_id: req.user?.staffId || staff_id,
      appointment_date,
      appointment_time,
      appointment_venue,
      scheduling_notes,
    });

    return res.status(200).json({
      success: true,
      message: 'Donation request accepted! Blood bag entry created in inventory with status UNFULFILLED.',
      data: result.request,
      bloodBag: result.bloodBag,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * Deny donation request
 * PUT /api/v1/giver/request/:id/deny
 */
export async function denyDonationRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const adminId = req.user?.id || req.user?._id || req.user?.sub || req.body?.admin_id;

    const updatedRequest = await giverService.denyDonationRequest(id, {
      reason: reason || 'Donation request denied by BBMS administration.',
      admin_id: adminId,
    });

    return res.status(200).json({
      success: true,
      message: 'Donation request denied.',
      data: updatedRequest,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * Fulfill the inventory entry for blood donation
 * PUT /api/v1/giver/request/:id/fulfill
 */
export async function fulfillDonationReceipt(req, res) {
  try {
    const { id } = req.params;
    const { staff_id, haemoglobin, pressure, weight } = req.body || {};

    const result = await giverService.fulfillDonationReceipt(id, {
      staff_id: req.user?.staffId || staff_id,
      haemoglobin,
      pressure,
      weight,
    });

    return res.status(200).json({
      success: true,
      message: 'Blood donation received! Inventory entry fulfilled and marked available.',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Get donor User profile for form pre-fill
 * GET /api/v1/giver/donor-profile
 */
export async function getDonorProfile(req, res) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id || req.query.u_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Donor user ID is required. Please login or provide u_id.',
      });
    }

    const profile = await giverService.getUserProfile(userId);
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Get the current active (non-terminal) request for a donor
 * GET /api/v1/giver/active-request
 */
export async function getActiveRequest(req, res) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id || req.query.u_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Donor user ID is required. Please login or provide u_id.',
      });
    }

    const activeRequest = await giverService.getActiveRequestByDonor(userId);
    return res.status(200).json({
      success: true,
      data: activeRequest || null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Find nearby hospitals and blood banks using pincode proximity
 * GET /api/v1/giver/nearby?pincode=&type=ALL|HOSPITAL|BLOOD_BANK&radius=5|10|25|50
 */
export async function getNearbyInstitutions(req, res) {
  try {
    const { pincode, type = 'ALL', radius } = req.query;
    if (!pincode) {
      return res.status(400).json({
        success: false,
        error: 'Pincode query parameter is required.',
      });
    }

    const institutions = await giverService.getNearbyInstitutions(pincode, {
      type,
      maxScore: radius ? Number(radius) : Infinity,
    });

    return res.status(200).json({
      success: true,
      count: institutions.length,
      data: institutions,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
}

// Named class export for object-oriented or grouped imports
export class GiverController {
  static applyDonationRequest = applyDonationRequest;
  static verifyDonationRequest = verifyDonationRequest;
  static acceptAndScheduleDonation = acceptAndScheduleDonation;
  static acceptDonationRequest = acceptDonationRequest;
  static denyDonationRequest = denyDonationRequest;
  static fulfillDonationReceipt = fulfillDonationReceipt;
  static completeDonation = completeDonation;
  static cancelDonationRequest = cancelDonationRequest;
  static getRequestDetails = getRequestDetails;
  static getMyRequests = getMyRequests;
  static getPendingAdminVerifications = getPendingAdminVerifications;
  static getHospitalRequests = getHospitalRequests;
  static getBloodBankRequests = getBloodBankRequests;
  static getAllRequests = getAllRequests;
  static getDonorProfile = getDonorProfile;
  static getActiveRequest = getActiveRequest;
  static getNearbyInstitutions = getNearbyInstitutions;
}

export default GiverController;