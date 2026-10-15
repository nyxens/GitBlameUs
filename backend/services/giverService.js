import mongoose from 'mongoose';
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

  // 1b. One-active-request guard: donor cannot have more than one non-terminal request
  const TERMINAL_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];
  const existingActive = await GiverRequest.findOne({
    u_id,
    status: { $nin: TERMINAL_STATUSES },
  });
  if (existingActive) {
    throw new Error(
      `You already have an active donation request (status: ${existingActive.status}). ` +
      'Please wait for it to be processed, or cancel it before submitting a new one.'
    );
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
 * Delete a donation request (Donor or Admin action)
 */
export async function deleteDonationRequest(requestId, { user_id = null } = {}) {
  let request = null;

  if (mongoose.Types.ObjectId.isValid(requestId)) {
    request = await GiverRequest.findById(requestId);
  }
  if (!request) {
    request = await GiverRequest.findOne({ _id: requestId }).catch(() => null);
  }

  // If request not found in DB (e.g. demo/mock ID), treat as successfully removed
  if (!request) {
    return { success: true, message: 'Donation request removed successfully', id: requestId };
  }

  if (user_id && request.u_id && request.u_id.toString() !== user_id.toString()) {
    throw new Error('Unauthorized: You can only delete your own donation request');
  }

  // If an unfulfilled BloodBag was generated upon accept, remove it
  if (request.bag_id) {
    const bag = await BloodBag.findById(request.bag_id);
    if (bag && bag.status === 'UNFULFILLED') {
      await BloodBag.findByIdAndDelete(request.bag_id);
    }
  }

  await GiverRequest.findByIdAndDelete(request._id);
  return { success: true, message: 'Donation request deleted successfully', id: requestId };
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
 * Accept donation request & automatically create unfulfilled inventory BloodBag entry
 */
export async function acceptDonationRequest(requestId, {
  admin_id = null,
  staff_id = null,
  appointment_date = null,
  appointment_time = null,
  appointment_venue = null,
  scheduling_notes = null,
} = {}) {
  const request = await GiverRequest.findById(requestId).populate('u_id');
  if (!request) {
    throw new Error('Donation request not found');
  }

  if (!['NOT_VERIFIED', 'VERIFIED', 'PENDING'].includes(request.status)) {
    throw new Error(`Cannot accept a request that is already ${request.status}`);
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
  }

  // 2. Resolve Inventory location
  let resolvedInventoryId = null;
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
    const newInv = await Inventory.create({
      cellno: 'CELL-INBOUND-01',
      shelfno: 'SHELF-01',
      pincode: donorUser.pincode || '10001',
      hos_or_bank_id: request.hospital_id || request.bloodbank_id || resolvedStaffId,
      hos_or_bank_type: request.target_type === 'BLOOD_BANK' ? 'BloodBank' : 'Hospital',
      capacity: 100,
      current_count: 0,
    });
    resolvedInventoryId = newInv._id;
  }

  // 3. Expiration date (42 days default)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 42);

  // 4. Barcode
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bloodGroupClean = (donorUser.bloodgroup || 'O+').replace('+', 'POS').replace('-', 'NEG');
  const barcode = `LV-DON-${bloodGroupClean}-${randomSuffix}`;

  // 5. Create or update BloodBag with status UNFULFILLED
  let bloodBag;
  if (request.bag_id) {
    bloodBag = await BloodBag.findById(request.bag_id);
  }

  if (!bloodBag) {
    bloodBag = await BloodBag.create({
      bloodgroup: donorUser.bloodgroup || 'O+',
      haemoglobin: 13.5,
      pressure: '120/80 mmHg',
      date_of_donation: new Date(),
      expired_date: expirationDate,
      S_Id: resolvedStaffId,
      I_ID: resolvedInventoryId,
      status: 'UNFULFILLED',
      weight: 450,
      barcode,
      donor_request_id: request._id,
      donor_user_id: donorUser._id,
      isdiscresed: false,
    });
  } else {
    bloodBag.status = 'UNFULFILLED';
    bloodBag.barcode = bloodBag.barcode || barcode;
    bloodBag.donor_request_id = request._id;
    bloodBag.donor_user_id = donorUser._id;
    await bloodBag.save();
  }

  // 6. Update GiverRequest
  request.status = 'ACCEPTED';
  request.accepted_at = new Date();
  request.bag_id = bloodBag._id;
  if (appointment_date) {
    request.appointment_date = new Date(appointment_date);
  } else if (request.preferred_date) {
    request.appointment_date = request.preferred_date;
  } else {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    request.appointment_date = defaultDate;
  }

  if (appointment_time) request.appointment_time = appointment_time;
  else if (!request.appointment_time) request.appointment_time = '10:00 AM';

  if (appointment_venue) request.appointment_venue = appointment_venue;
  if (scheduling_notes) request.scheduling_notes = scheduling_notes;
  if (admin_id) request.admin_id = admin_id;

  await request.save();

  const populatedRequest = await GiverRequest.findById(request._id).populate(POPULATE_GIVER_REQUEST);
  return { request: populatedRequest, bloodBag };
}

/**
 * Deny a donation request
 */
export async function denyDonationRequest(requestId, { reason = 'Donation request denied by BBMS staff', admin_id = null } = {}) {
  const request = await GiverRequest.findById(requestId);
  if (!request) {
    throw new Error('Donation request not found');
  }

  if (request.status === 'COMPLETED') {
    throw new Error('Cannot deny a donation request that has already been completed');
  }

  if (request.bag_id) {
    await BloodBag.findByIdAndUpdate(request.bag_id, { status: 'DISCARDED', isdiscresed: true });
  }

  request.status = 'REJECTED';
  request.rejection_reason = reason;
  if (admin_id) request.admin_id = admin_id;

  await request.save();
  return GiverRequest.findById(request._id).populate(POPULATE_GIVER_REQUEST);
}

/**
 * Fulfill the inventory entry when BBMS receives the blood
 */
export async function fulfillDonationReceipt(identifier, {
  staff_id = null,
  haemoglobin = 13.5,
  pressure = '120/80 mmHg',
  weight = 450,
} = {}) {
  let bloodBag = await BloodBag.findById(identifier);
  let request = null;

  if (!bloodBag) {
    request = await GiverRequest.findById(identifier).populate('u_id');
    if (request && request.bag_id) {
      bloodBag = await BloodBag.findById(request.bag_id);
    }
  } else if (bloodBag.donor_request_id) {
    request = await GiverRequest.findById(bloodBag.donor_request_id).populate('u_id');
  }

  if (!bloodBag) {
    throw new Error('Blood bag or donation entry not found');
  }
  if (bloodBag.status !== 'UNFULFILLED') {
    throw new Error('This donation has already been received.');
  }

  let resolvedStaffId = staff_id;
  if (!resolvedStaffId) {
    const defaultStaff = await Staff.findOne({});
    resolvedStaffId = defaultStaff ? defaultStaff._id : null;
  }

  bloodBag.status = 'AVAILABLE';
  bloodBag.fulfilled_at = new Date();
  if (resolvedStaffId) bloodBag.fulfilled_by = resolvedStaffId;
  if (haemoglobin) bloodBag.haemoglobin = Number(haemoglobin);
  if (pressure) bloodBag.pressure = pressure;
  if (weight) bloodBag.weight = Number(weight);
  await bloodBag.save();

  if (request) {
    request.status = 'COMPLETED';
    request.completed_at = new Date();
    if (resolvedStaffId) request.staff_id = resolvedStaffId;
    await request.save();
  }

  const donorUserId = bloodBag.donor_user_id || request?.u_id?._id || request?.u_id;
  if (donorUserId) {
    const existingDonorLog = await Donor.findOne({ bag_id: bloodBag._id });
    if (!existingDonorLog) {
      const donorUser = await User.findById(donorUserId);
      await Donor.create({
        u_id: donorUserId,
        date_of_donation: new Date(),
        weight_donated: bloodBag.weight || 450,
        bag_id: bloodBag._id,
        S_Id: resolvedStaffId || bloodBag.S_Id,
        pincode: donorUser?.pincode || '10001',
      });
    }
  }

  if (bloodBag.I_ID) {
    await Inventory.findByIdAndUpdate(bloodBag.I_ID, { $inc: { current_count: 1 } });
  }

  const populatedRequest = request ? await GiverRequest.findById(request._id).populate(POPULATE_GIVER_REQUEST) : null;

  return {
    success: true,
    message: 'Blood donation received and inventory entry fulfilled.',
    bloodBag,
    request: populatedRequest,
  };
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

/**
 * QUERY: Get donor User profile for form pre-fill
 */
export async function getUserProfile(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

/**
 * QUERY: Get the current active (non-terminal) request for a donor.
 * Returns null if none exists.
 */
export async function getActiveRequestByDonor(userId) {
  const TERMINAL_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];
  return GiverRequest.findOne({
    u_id: userId,
    status: { $nin: TERMINAL_STATUSES },
  }).populate(POPULATE_GIVER_REQUEST);
}

/**
 * QUERY: Find nearby hospitals and blood banks using pincode proximity.
 * Algorithm: numeric distance |institution_pincode - user_pincode|.
 * A lower score means closer (same area code range).
 *
 * @param {string} pincode  - User's pincode (reference point)
 * @param {object} options
 *   @param {'ALL'|'HOSPITAL'|'BLOOD_BANK'} options.type - Filter by institution type
 *   @param {number} options.maxScore - Max allowed pincode numeric distance (radius proxy)
 * @returns {Array} Sorted results with distance_score and institution_type fields
 */
export async function getNearbyInstitutions(pincode, { type = 'ALL', maxScore = Infinity } = {}) {
  const userPin = parseInt(pincode, 10);
  if (isNaN(userPin)) {
    throw new Error('Invalid pincode provided');
  }

  const results = [];

  // Fetch hospitals unless type is BLOOD_BANK only
  if (type === 'ALL' || type === 'HOSPITAL') {
    const hospitals = await Hospital.find({}).select(
      'hos_name pincode phone email address admin_id I_Id'
    ).lean();
    for (const h of hospitals) {
      const hPin = parseInt(h.pincode, 10);
      if (isNaN(hPin)) continue;
      const score = Math.abs(hPin - userPin);
      if (score <= maxScore) {
        results.push({
          _id: h._id,
          name: h.hos_name,
          institution_type: 'HOSPITAL',
          pincode: h.pincode,
          phone: h.phone || null,
          email: h.email || null,
          address: h.address || null,
          distance_score: score,
        });
      }
    }
  }

  // Fetch blood banks unless type is HOSPITAL only
  if (type === 'ALL' || type === 'BLOOD_BANK') {
    const bloodBanks = await BloodBank.find({}).select(
      'bank_name pincode contact_no email address admin_id I_Id'
    ).lean();
    for (const bb of bloodBanks) {
      const bbPin = parseInt(bb.pincode, 10);
      if (isNaN(bbPin)) continue;
      const score = Math.abs(bbPin - userPin);
      if (score <= maxScore) {
        results.push({
          _id: bb._id,
          name: bb.bank_name,
          institution_type: 'BLOOD_BANK',
          pincode: bb.pincode,
          phone: bb.contact_no || null,
          email: bb.email || null,
          address: bb.address || null,
          distance_score: score,
        });
      }
    }
  }

  // Sort by proximity (ascending distance_score), then name
  results.sort((a, b) => a.distance_score - b.distance_score || a.name.localeCompare(b.name));

  return results;
}

const EARTH_RADIUS_KM = 6371;
const GEOCODE_ATTEMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MAX_GEOCODES_PER_REQUEST = 5;

function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

const hasCoords = (doc) => Number.isFinite(doc.latitude) && Number.isFinite(doc.longitude);

/** Geocode an address (falling back to pincode) via OpenStreetMap Nominatim. Returns {lat,lng} or null. */
async function geocode(doc) {
  const queries = [doc.address, doc.pincode].filter(Boolean);
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { 'User-Agent': 'LifeVault-BBMS/1.0' }, signal: AbortSignal.timeout(4000) }
      );
      if (!res.ok) continue;
      const [hit] = await res.json();
      if (hit) return { lat: Number(hit.lat), lng: Number(hit.lon) };
    } catch (_err) {
      // network failure / timeout: try next query
    }
  }
  return null;
}

/** Fill in missing coordinates (bounded per request, rate-limited by a cooldown) and persist them. */
async function ensureCoordinates(Model, docs) {
  const now = Date.now();
  const pending = docs
    .filter((d) => !hasCoords(d)
      && !(d.geocodeAttemptedAt && now - new Date(d.geocodeAttemptedAt).getTime() < GEOCODE_ATTEMPT_COOLDOWN_MS))
    .slice(0, MAX_GEOCODES_PER_REQUEST);
  for (const d of pending) {
    const point = await geocode(d);
    const update = point
      ? { latitude: point.lat, longitude: point.lng, geocodeAttemptedAt: new Date() }
      : { geocodeAttemptedAt: new Date() };
    await Model.updateOne({ _id: d._id }, update);
    Object.assign(d, update);
  }
}

/**
 * QUERY: Find nearby hospitals and blood banks by real distance (Haversine) from GPS coordinates.
 * Institutions without coordinates are geocoded lazily; any still unlocated are listed last
 * with distance_km = null.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {object} options
 *   @param {'ALL'|'HOSPITAL'|'BLOOD_BANK'} options.type
 *   @param {number} options.radiusKm - max distance in km (Infinity = no limit)
 */
export async function getNearbyInstitutionsByLocation(lat, lng, { type = 'ALL', radiusKm = Infinity } = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw new Error('Invalid latitude/longitude provided');
  }

  const sources = [];
  if (type === 'ALL' || type === 'HOSPITAL') {
    sources.push({
      Model: Hospital,
      institution_type: 'HOSPITAL',
      select: 'hos_name pincode phone email address latitude longitude geocodeAttemptedAt',
      nameKey: 'hos_name',
      phoneKey: 'phone',
    });
  }
  if (type === 'ALL' || type === 'BLOOD_BANK') {
    sources.push({
      Model: BloodBank,
      institution_type: 'BLOOD_BANK',
      select: 'bank_name pincode contact_no email address latitude longitude geocodeAttemptedAt',
      nameKey: 'bank_name',
      phoneKey: 'contact_no',
    });
  }

  const located = [];
  const unlocated = [];
  for (const src of sources) {
    const docs = await src.Model.find({}).select(src.select).lean();
    await ensureCoordinates(src.Model, docs);
    for (const d of docs) {
      const base = {
        _id: d._id,
        name: d[src.nameKey],
        institution_type: src.institution_type,
        pincode: d.pincode,
        phone: d[src.phoneKey] || null,
        email: d.email || null,
        address: d.address || null,
        latitude: hasCoords(d) ? d.latitude : null,
        longitude: hasCoords(d) ? d.longitude : null,
      };
      if (!hasCoords(d)) {
        unlocated.push({ ...base, distance_km: null, distance_score: Number.MAX_SAFE_INTEGER });
        continue;
      }
      const km = haversineKm(lat, lng, d.latitude, d.longitude);
      if (km <= radiusKm) {
        located.push({ ...base, distance_km: Math.round(km * 10) / 10, distance_score: km });
      }
    }
  }

  located.sort((a, b) => a.distance_score - b.distance_score || a.name.localeCompare(b.name));
  unlocated.sort((a, b) => a.name.localeCompare(b.name));
  return [...located, ...unlocated];
}

export default {
  createDonationRequest,
  verifyDonationRequest,
  acceptAndScheduleRequest,
  acceptDonationRequest,
  denyDonationRequest,
  fulfillDonationReceipt,
  completeDonation,
  cancelDonationRequest,
  deleteDonationRequest,
  getDonationRequestById,
  getRequestsByDonor,
  getRequestsPendingVerification,
  getRequestsForHospital,
  getRequestsForBloodBank,
  getAllDonationRequests,
  getUserProfile,
  getActiveRequestByDonor,
  getNearbyInstitutions,
  getNearbyInstitutionsByLocation,
};
