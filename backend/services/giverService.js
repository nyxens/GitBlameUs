import GiverRequest, {
  GIVER_REQUEST_STATUSES,
  TARGET_INSTITUTION_TYPES,
} from '../models/GiverRequest.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import BloodBank from '../models/BloodBank.js';
import BloodBag from '../models/BloodBag.js';
import Donor from '../models/Donor.js';
import Staff from '../models/Staff.js';
import Inventory from '../models/Inventory.js';
import Admin from '../models/Admin.js';

/**
 * =======================================================================================
 * GIVER SERVICE (DATABASE QUERIES & BUSINESS LOGIC)
 * =======================================================================================
 * Manages database operations across all 4 donation workflow phases:
 * Phase 1: Request Creation (Donor)
 * Phase 2: Credential Verification (Admin)
 * Phase 3: Acceptance & Appointment Scheduling (Hospital / BloodBank)
 * Phase 4: Donation Completion & Blood Bag Creation (Hospital / Staff)
 * =======================================================================================
 */

// Helper to populate complete giver request details
const POPULATE_GIVER_REQUEST = [
  { path: 'u_id', select: 'name username email phone bloodgroup DOB gender pincode status' },
  { path: 'hospital_id', select: 'hos_name pincode phone email address I_Id' },
  { path: 'bloodbank_id', select: 'bank_name pincode contact_no email address I_Id' },
  { path: 'admin_id', select: 'username email role' },
  { path: 'staff_id', select: 'role department licence_id' },
  { path: 'bag_id' },
];

/**
 * PHASE 1: Create a new donation request (Donor submission)
 * Status initializes to 'NOT_VERIFIED'
 */
export async function createDonationRequest({
  u_id,
  target_type = 'HOSPITAL',
  hospital_id = null,
  bloodbank_id = null,
  preferred_date = null,
  donor_notes = null,
}) {
  if (!u_id) {
    throw new Error('Donor user ID (u_id) is required');
  }

  // 1. Verify that donor exists in User collection
  const donorUser = await User.findById(u_id);
  if (!donorUser) {
    throw new Error('Donor user not found');
  }

  // 2. Validate target institution exists
  if (target_type === 'HOSPITAL') {
    if (!hospital_id) {
      throw new Error('Hospital ID is required when target institution is HOSPITAL');
    }
    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new Error('Target Hospital not found');
    }
  } else if (target_type === 'BLOOD_BANK') {
    if (!bloodbank_id) {
      throw new Error('BloodBank ID is required when target institution is BLOOD_BANK');
    }
    const bloodBank = await BloodBank.findById(bloodbank_id);
    if (!bloodBank) {
      throw new Error('Target Blood Bank not found');
    }
  } else {
    throw new Error(`Invalid target_type. Must be one of: ${TARGET_INSTITUTION_TYPES.join(', ')}`);
  }

  // 3. Create the GiverRequest with initial status NOT_VERIFIED
  const newRequest = await GiverRequest.create({
    u_id,
    target_type,
    hospital_id: target_type === 'HOSPITAL' ? hospital_id : null,
    bloodbank_id: target_type === 'BLOOD_BANK' ? bloodbank_id : null,
    preferred_date: preferred_date ? new Date(preferred_date) : null,
    donor_notes,
    status: 'NOT_VERIFIED',
  });

  return GiverRequest.findById(newRequest._id).populate(POPULATE_GIVER_REQUEST);
}

/**
 * PHASE 2: Verify donor credentials (Admin action)
 * Transitions status from 'NOT_VERIFIED' to 'VERIFIED' (or 'REJECTED')
 */
export async function verifyDonationRequest(requestId, {
  admin_id = null,
  is_approved = true,
  verification_notes = null,
  rejection_reason = null,
}) {
  const request = await GiverRequest.findById(requestId);
  if (!request) {
    throw new Error('Donation request not found');
  }

  if (request.status !== 'NOT_VERIFIED') {
    throw new Error(`Cannot verify request with current status '${request.status}'. Expected 'NOT_VERIFIED'`);
  }

  if (is_approved) {
    // Verified by admin -> transitions to VERIFIED (ready for hospital dashboard)
    request.status = 'VERIFIED';
    request.admin_id = admin_id;
    request.verified_at = new Date();
    request.verification_notes = verification_notes || 'Donor credentials and eligibility verified by Admin.';
  } else {
    // Rejected by admin
    request.status = 'REJECTED';
    request.admin_id = admin_id;
    request.verified_at = new Date();
    request.rejection_reason = rejection_reason || verification_notes || 'Credentials rejected by Admin.';
  }

  await request.save();
  return GiverRequest.findById(request._id).populate(POPULATE_GIVER_REQUEST);
}

/**
 * PHASE 3: Accept request and schedule appointment (Hospital / BloodBank action)
 * Transitions status from 'VERIFIED' (or 'PENDING') to 'ACCEPTED'
 * Stores appointment date, time, and venue
 */
export async function acceptAndScheduleRequest(requestId, {
  institution_id = null, // hospital_id or bloodbank_id for authorization
  appointment_date,
  appointment_time,
  appointment_venue = null,
  scheduling_notes = null,
}) {
  if (!appointment_date) {
    throw new Error('Appointment date is required to schedule the donation');
  }
  if (!appointment_time) {
    throw new Error('Appointment time is required to schedule the donation');
  }

  const request = await GiverRequest.findById(requestId);
  if (!request) {
    throw new Error('Donation request not found');
  }

  // Allow verified or pending requests to be accepted
  if (request.status !== 'VERIFIED' && request.status !== 'PENDING') {
    throw new Error(`Cannot accept request in status '${request.status}'. Request must be 'VERIFIED' or 'PENDING'`);
  }

  // Optional: Verify institution ownership if ID provided
  if (institution_id) {
    const targetMatches =
      (request.target_type === 'HOSPITAL' && request.hospital_id?.toString() === institution_id.toString()) ||
      (request.target_type === 'BLOOD_BANK' && request.bloodbank_id?.toString() === institution_id.toString());

    if (!targetMatches) {
      throw new Error('Unauthorized: This request belongs to a different institution');
    }
  }

  request.status = 'ACCEPTED';
  request.accepted_at = new Date();
  request.appointment_date = new Date(appointment_date);
  request.appointment_time = appointment_time;
  request.appointment_venue = appointment_venue;
  request.scheduling_notes = scheduling_notes;

  await request.save();
  return GiverRequest.findById(request._id).populate(POPULATE_GIVER_REQUEST);
}

/**
 * PHASE 4: Complete donation and generate BloodBag entry (Hospital / Staff action)
 * Transitions status from 'ACCEPTED' to 'COMPLETED'
 * Automatically creates:
 *   1. BloodBag entry in inventory
 *   2. Donor historical record
 *   3. Links bag_id back into GiverRequest
 */
export async function completeDonation(requestId, {
  staff_id = null,
  haemoglobin = 13.5,
  pressure = '120/80 mmHg',
  volume_donated_ml = 450,
  inventory_id = null,
  expiry_days = 35,
}) {
  const request = await GiverRequest.findById(requestId).populate('u_id');
  if (!request) {
    throw new Error('Donation request not found');
  }

  if (request.status !== 'ACCEPTED') {
    throw new Error(`Cannot complete donation for request with status '${request.status}'. Expected 'ACCEPTED'`);
  }

  const donorUser = request.u_id;
  if (!donorUser) {
    throw new Error('Associated donor user record not found');
  }

  // 1. Resolve Staff
  let resolvedStaffId = staff_id;
  if (!resolvedStaffId) {
    const defaultStaff = await Staff.findOne({});
    resolvedStaffId = defaultStaff ? defaultStaff._id : null;
    if (!resolvedStaffId) {
      throw new Error('A valid Staff reference (staff_id) is required to complete blood collection');
    }
  }

  // 2. Resolve Inventory (Target Hospital/Bank inventory or fallback)
  let resolvedInventoryId = inventory_id;
  if (!resolvedInventoryId) {
    if (request.target_type === 'HOSPITAL' && request.hospital_id) {
      const hospital = await Hospital.findById(request.hospital_id);
      resolvedInventoryId = hospital?.I_Id;
    } else if (request.target_type === 'BLOOD_BANK' && request.bloodbank_id) {
      const bloodBank = await BloodBank.findById(request.bloodbank_id);
      resolvedInventoryId = bloodBank?.I_Id;
    }

    if (!resolvedInventoryId) {
      const defaultInventory = await Inventory.findOne({});
      resolvedInventoryId = defaultInventory ? defaultInventory._id : null;
    }

    if (!resolvedInventoryId) {
      throw new Error('No valid Inventory (I_ID) found to register the new blood bag');
    }
  }

  // 3. Compute expiration date (default 35 days for whole blood)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + (expiry_days || 35));

  // 4. Create new BloodBag entry in database
  const bloodBag = await BloodBag.create({
    bloodgroup: donorUser.bloodgroup || 'O+',
    haemoglobin: Number(haemoglobin) || 13.5,
    pressure: pressure || '120/80 mmHg',
    date_of_donation: new Date(),
    expired_date: expirationDate,
    S_Id: resolvedStaffId,
    I_ID: resolvedInventoryId,
    status: 'AVAILABLE',
    weight: Number(volume_donated_ml) || 450,
    isdiscresed: false,
  });

  // 5. Create record in historical Donor collection
  const donorRecord = await Donor.create({
    u_id: donorUser._id,
    date_of_donation: new Date(),
    weight_donated: Number(volume_donated_ml) || 450,
    bag_id: bloodBag._id,
    S_Id: resolvedStaffId,
    pincode: donorUser.pincode || '000000',
  });

  // 6. Update GiverRequest to 'COMPLETED' and link bloodbag
  request.status = 'COMPLETED';
  request.completed_at = new Date();
  request.bag_id = bloodBag._id;
  request.staff_id = resolvedStaffId;

  await request.save();

  const populatedRequest = await GiverRequest.findById(request._id).populate(POPULATE_GIVER_REQUEST);

  return {
    request: populatedRequest,
    bloodBag,
    donorRecord,
  };
}

/**
 * Cancel a donation request (Donor or Institution action)
 */
export async function cancelDonationRequest(requestId, { user_id = null, reason = 'Cancelled by user' }) {
  const request = await GiverRequest.findById(requestId);
  if (!request) {
    throw new Error('Donation request not found');
  }

  if (request.status === 'COMPLETED') {
    throw new Error('Cannot cancel a donation request that has already been completed');
  }

  if (request.status === 'CANCELLED' || request.status === 'REJECTED') {
    throw new Error(`Request is already in '${request.status}' state`);
  }

  // Verify ownership if user_id provided
  if (user_id && request.u_id.toString() !== user_id.toString()) {
    throw new Error('Unauthorized: You can only cancel your own donation request');
  }

  request.status = 'CANCELLED';
  request.rejection_reason = reason;
  await request.save();

  return GiverRequest.findById(request._id).populate(POPULATE_GIVER_REQUEST);
}

/**
 * QUERY: Get single request by ID with all populated details
 */
export async function getDonationRequestById(requestId) {
  const request = await GiverRequest.findById(requestId).populate(POPULATE_GIVER_REQUEST);
  if (!request) {
    throw new Error('Donation request not found');
  }
  return request;
}

/**
 * QUERY: Get all donation requests submitted by a specific donor
 */
export async function getRequestsByDonor(userId, filter = {}) {
  return GiverRequest.find({ u_id: userId, ...filter })
    .populate(POPULATE_GIVER_REQUEST)
    .sort({ createdAt: -1 });
}

/**
 * QUERY: Get requests awaiting Admin credential verification
 */
export async function getRequestsPendingVerification(filter = {}) {
  return GiverRequest.find({ status: 'NOT_VERIFIED', ...filter })
    .populate(POPULATE_GIVER_REQUEST)
    .sort({ createdAt: -1 });
}

/**
 * QUERY: Get requests for a specific Hospital dashboard (e.g. VERIFIED, ACCEPTED, COMPLETED)
 */
export async function getRequestsForHospital(hospitalId, { status = null } = {}) {
  const query = {
    target_type: 'HOSPITAL',
    hospital_id: hospitalId,
  };

  if (status) {
    query.status = status;
  } else {
    // Default: show actionable and scheduled requests (VERIFIED, PENDING, ACCEPTED)
    query.status = { $in: ['VERIFIED', 'PENDING', 'ACCEPTED'] };
  }

  return GiverRequest.find(query)
    .populate(POPULATE_GIVER_REQUEST)
    .sort({ appointment_date: 1, createdAt: -1 });
}

/**
 * QUERY: Get requests for a specific Blood Bank dashboard
 */
export async function getRequestsForBloodBank(bloodbankId, { status = null } = {}) {
  const query = {
    target_type: 'BLOOD_BANK',
    bloodbank_id: bloodbankId,
  };

  if (status) {
    query.status = status;
  } else {
    query.status = { $in: ['VERIFIED', 'PENDING', 'ACCEPTED'] };
  }

  return GiverRequest.find(query)
    .populate(POPULATE_GIVER_REQUEST)
    .sort({ appointment_date: 1, createdAt: -1 });
}

/**
 * QUERY: List all giver requests with filtering and pagination
 */
export async function getAllDonationRequests(filter = {}, { limit = 50, skip = 0 } = {}) {
  const [total, requests] = await Promise.all([
    GiverRequest.countDocuments(filter),
    GiverRequest.find(filter)
      .populate(POPULATE_GIVER_REQUEST)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit)),
  ]);

  return { total, count: requests.length, requests };
}

export default {
  createDonationRequest,
  verifyDonationRequest,
  acceptAndScheduleRequest,
  completeDonation,
  cancelDonationRequest,
  getDonationRequestById,
  getRequestsByDonor,
  getRequestsPendingVerification,
  getRequestsForHospital,
  getRequestsForBloodBank,
  getAllDonationRequests,
};
