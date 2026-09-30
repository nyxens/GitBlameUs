import * as seekerService from '../services/seekerService.js';

/**
 * =======================================================================================
 * SEEKER CONTROLLER
 * =======================================================================================
 * Handles incoming HTTP requests and responses for the seeker blood requisition workflow.
 * Delegates all database queries and business logic to seekerService.js.
 * 
 * PHASES:
 * 1. applySeekerRequest            -> Seeker applies for blood (status: NOT_VERIFIED)
 * 2. verifySeekerRequest           -> Admin verifies prescription/credentials (status: VERIFIED / REJECTED)
 * 3. acceptAndScheduleSeekerRequest-> Hospital accepts & schedules pickup (status: ACCEPTED)
 * 4. fulfillSeekerRequest          -> Hospital dispenses blood units (status: COMPLETED)
 * 5. cancelSeekerRequest           -> Seeker cancels requisition (status: CANCELLED)
 * =======================================================================================
 */

/**
 * PHASE 1: Seeker applies for blood units
 * POST /api/v1/seeker/request
 */
export async function applySeekerRequest(req, res) {
  try {
    const {
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
    } = req.body;

    const seekerId = req.user?.id || req.user?._id || req.user?.sub || u_id;

    if (!seekerId) {
      return res.status(400).json({
        success: false,
        error: 'Seeker user ID is required. Please login or provide u_id.',
      });
    }

    const request = await seekerService.createSeekerRequest({
      u_id: seekerId,
      patient_name,
      bloodgroup,
      units,
      weight,
      is_emergency,
      target_type: target_type || 'HOSPITAL',
      hospital_id,
      bloodbank_id,
      required_date,
      seeker_notes,
      pincode,
    });

    return res.status(201).json({
      success: true,
      message: 'Blood requisition submitted successfully. Awaiting Admin verification.',
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
 * PHASE 2: Admin reviews & verifies seeker credentials / medical necessity
 * PUT /api/v1/seeker/request/:id/verify
 */
export async function verifySeekerRequest(req, res) {
  try {
    const { id } = req.params;
    const { is_approved = true, verification_notes, rejection_reason } = req.body;

    const adminId = req.user?.id || req.user?._id || req.user?.sub || req.body.admin_id;

    const updatedRequest = await seekerService.verifySeekerRequest(id, {
      admin_id: adminId,
      is_approved: is_approved === true || is_approved === 'true',
      verification_notes,
      rejection_reason,
    });

    const actionText = updatedRequest.status === 'VERIFIED' ? 'verified' : 'rejected';

    return res.status(200).json({
      success: true,
      message: `Blood requisition successfully ${actionText} by Admin.`,
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
 * PHASE 3: Hospital or Blood Bank accepts verified request and schedules pickup
 * PUT /api/v1/seeker/request/:id/schedule
 */
export async function acceptAndScheduleSeekerRequest(req, res) {
  try {
    const { id } = req.params;
    const {
      schedule_date,
      schedule_time,
      pickup_venue,
      scheduling_notes,
      institution_id,
      staff_id,
      allocated_bag_ids,
    } = req.body;

    if (!schedule_date || !schedule_time) {
      return res.status(400).json({
        success: false,
        error: 'Both schedule_date and schedule_time are required to confirm the blood requisition.',
      });
    }

    const scheduledRequest = await seekerService.acceptAndScheduleRequest(id, {
      institution_id: req.user?.institutionId || institution_id,
      schedule_date,
      schedule_time,
      pickup_venue,
      scheduling_notes,
      staff_id: req.user?.staffId || staff_id,
      allocated_bag_ids,
    });

    return res.status(200).json({
      success: true,
      message: 'Blood request accepted and scheduled successfully.',
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
 * PHASE 4: Hospital / Staff marks requisition as fulfilled & blood units dispatched
 * POST /api/v1/seeker/request/:id/fulfill
 * PUT /api/v1/seeker/request/:id/fulfill
 */
export async function fulfillSeekerRequest(req, res) {
  try {
    const { id } = req.params;
    const { staff_id, notes, allocated_bag_ids } = req.body || {};

    const staffId = req.user?.staffId || staff_id;

    const result = await seekerService.fulfillSeekerRequest(id, {
      staff_id: staffId,
      notes,
      allocated_bag_ids: allocated_bag_ids || [],
    });

    return res.status(200).json({
      success: true,
      message: 'Blood request fulfilled! Units dispatched to patient.',
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
 * Cancel a seeker request
 * PUT /api/v1/seeker/request/:id/cancel
 */
export async function cancelSeekerRequest(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id || req.user?._id || req.body?.u_id;

    const cancelledRequest = await seekerService.cancelSeekerRequest(id, {
      user_id: userId,
      reason: reason || 'Cancelled by seeker.',
    });

    return res.status(200).json({
      success: true,
      message: 'Blood request cancelled successfully.',
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
 * QUERY: Get single seeker request by ID
 * GET /api/v1/seeker/request/:id
 */
export async function getRequestDetails(req, res) {
  try {
    const { id } = req.params;
    const request = await seekerService.getSeekerRequestById(id);
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
 * QUERY: Get all seeker requests submitted by the logged-in seeker
 * GET /api/v1/seeker/my-requests
 */
export async function getMyRequests(req, res) {
  try {
    const userId = req.user?.id || req.user?._id || req.query.u_id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Seeker user ID is required. Please login or pass u_id in query.',
      });
    }

    const requests = await seekerService.getRequestsBySeeker(userId);
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
 * QUERY: Get the logged-in seeker's active blood request
 * GET /api/v1/seeker/active-request
 */
export async function getActiveRequest(req, res) {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.sub || req.query.u_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authenticated user ID is required.',
      });
    }

    const request = await seekerService.getActiveRequestBySeeker(userId);
    return res.status(200).json({
      success: true,
      data: request || null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * QUERY: Find nearby hospitals and blood banks with inventory stock
 * GET /api/v1/seeker/nearby
 */
export async function getNearbyInstitutions(req, res) {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.sub;
    const pincode = req.query.pincode;
    const type = req.query.type || 'ALL';
    const radius = req.query.radius === undefined || req.query.radius === '' ? Infinity : Number(req.query.radius);

    const hasLat = req.query.lat !== undefined && req.query.lat !== '';
    const hasLng = req.query.lng !== undefined && req.query.lng !== '';

    // Location mode: real distance from GPS coordinates
    if (hasLat || hasLng) {
      const lat = Number(req.query.lat);
      const lng = Number(req.query.lng);
      if (!hasLat || !hasLng || !Number.isFinite(lat) || !Number.isFinite(lng)
        || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return res.status(400).json({ success: false, error: 'Valid lat and lng are required.' });
      }
      if (!Number.isFinite(radius) && radius !== Infinity) {
        return res.status(400).json({ success: false, error: 'Radius must be a number.' });
      }
      const institutions = await seekerService.getNearbyInstitutionsByLocation(lat, lng, {
        type,
        radiusKm: radius,
      });
      return res.status(200).json({
        success: true,
        mode: 'location',
        count: institutions.length,
        data: institutions,
      });
    }

    if (!userId && !pincode) {
      return res.status(400).json({
        success: false,
        error: 'Pincode is required when no authenticated user profile is available.',
      });
    }

    if (!Number.isFinite(radius) && radius !== Infinity) {
      return res.status(400).json({
        success: false,
        error: 'Radius must be a number.',
      });
    }

    const profile = pincode ? null : await seekerService.getUserProfile(userId);
    const institutions = await seekerService.getNearbyInstitutions(pincode || profile?.pincode || '10001', {
      type,
      maxScore: radius,
    });

    return res.status(200).json({
      success: true,
      mode: 'pincode',
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

/**
 * QUERY: Get seeker User profile for form pre-fill
 * GET /api/v1/seeker/seeker-profile
 */
export async function getSeekerProfile(req, res) {
  try {
    const userId = req.user?.sub || req.user?.id || req.user?._id || req.query.u_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Seeker user ID is required. Please login or provide u_id.',
      });
    }

    const profile = await seekerService.getUserProfile(userId);
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
 * QUERY: Get requests awaiting Admin credential verification
 * GET /api/v1/seeker/admin/pending
 */
export async function getPendingAdminVerifications(_req, res) {
  try {
    const requests = await seekerService.getRequestsPendingVerification();
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
 * GET /api/v1/seeker/hospital/:hospitalId
 */
export async function getHospitalRequests(req, res) {
  try {
    const { hospitalId } = req.params;
    const { status } = req.query;

    const requests = await seekerService.getRequestsForHospital(hospitalId, { status });
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
 * GET /api/v1/seeker/bloodbank/:bloodbankId
 */
export async function getBloodBankRequests(req, res) {
  try {
    const { bloodbankId } = req.params;
    const { status } = req.query;

    const requests = await seekerService.getRequestsForBloodBank(bloodbankId, { status });
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
 * QUERY: List all seeker requests with optional filtering and pagination
 * GET /api/v1/seeker/requests
 */
export async function getAllRequests(req, res) {
  try {
    const { status, target_type, bloodgroup, is_emergency, limit, skip } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (target_type) filter.target_type = target_type;
    if (bloodgroup) filter.bloodgroup = bloodgroup;
    if (is_emergency !== undefined) filter.is_emergency = is_emergency === 'true';

    const result = await seekerService.getAllSeekerRequests(filter, { limit, skip });
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

export class SeekerController {
  static applySeekerRequest = applySeekerRequest;
  static verifySeekerRequest = verifySeekerRequest;
  static acceptAndScheduleSeekerRequest = acceptAndScheduleSeekerRequest;
  static fulfillSeekerRequest = fulfillSeekerRequest;
  static cancelSeekerRequest = cancelSeekerRequest;
  static getRequestDetails = getRequestDetails;
  static getMyRequests = getMyRequests;
  static getActiveRequest = getActiveRequest;
  static getSeekerProfile = getSeekerProfile;
  static getNearbyInstitutions = getNearbyInstitutions;
  static getPendingAdminVerifications = getPendingAdminVerifications;
  static getHospitalRequests = getHospitalRequests;
  static getBloodBankRequests = getBloodBankRequests;
  static getAllRequests = getAllRequests;
}

export default SeekerController;
