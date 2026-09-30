import SeekerRequest, {
  SEEKER_REQUEST_STATUSES,
  TARGET_INSTITUTION_TYPES,
  BLOOD_GROUPS,
} from '../models/SeekerRequest.js';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import BloodBank from '../models/BloodBank.js';
import BloodBag from '../models/BloodBag.js';
import Allotment from '../models/Allotment.js';
import Staff from '../models/Staff.js';
import Inventory from '../models/Inventory.js';
import Admin from '../models/Admin.js';

/**
 * =======================================================================================
 * SEEKER SERVICE (DATABASE QUERIES & BUSINESS LOGIC)
 * =======================================================================================
 * Manages database operations across all 4 blood requisition workflow phases:
 * Phase 1: Request Creation (Seeker / Patient Requisition)
 * Phase 2: Medical & Prescription Verification (Admin)
 * Phase 3: Acceptance & Dispatch/Pickup Scheduling (Hospital / BloodBank)
 * Phase 4: Allotment Fulfillment & Blood Bag Release (Hospital / Staff)
 * =======================================================================================
 */

// Helper to populate complete seeker request details
const POPULATE_SEEKER_REQUEST = [
  { path: 'u_id', select: 'name username email phone bloodgroup DOB gender pincode status' },
  { path: 'hospital_id', select: 'hos_name pincode phone email address I_Id' },
  { path: 'bloodbank_id', select: 'bank_name pincode contact_no email address I_Id' },
  { path: 'admin_id', select: 'username email role' },
  { path: 'staff_id', select: 'role department licence_id' },
  { path: 'allocated_bags' },
  { path: 'allotment_id' },
];

/**
 * PHASE 1: Create a new blood requisition (Seeker submission)
 * Status initializes to 'NOT_VERIFIED'
 */
export async function createSeekerRequest({
  u_id,
  patient_name = null,
  bloodgroup,
  units = 1,
  weight = null,
  is_emergency = false,
  target_type = 'HOSPITAL',
  hospital_id = null,
  bloodbank_id = null,
  required_date = null,
  seeker_notes = null,
  pincode = null,
}) {
  if (!u_id) {
    throw new Error('Seeker user ID (u_id) is required');
  }

  // 1. Verify seeker user exists
  const seekerUser = await User.findById(u_id);
  if (!seekerUser) {
    throw new Error('Seeker user not found');
  }

  // 1b. Validate blood group
  const resolvedBloodGroup = bloodgroup || seekerUser.bloodgroup;
  if (!resolvedBloodGroup || !BLOOD_GROUPS.includes(resolvedBloodGroup)) {
    throw new Error(`Valid blood group is required. Allowed: ${BLOOD_GROUPS.join(', ')}`);
  }

  // 1c. One-active-request guard: seeker cannot have more than one non-terminal request
  const TERMINAL_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];
  const existingActive = await SeekerRequest.findOne({
    u_id,
    status: { $nin: TERMINAL_STATUSES },
  });

  if (existingActive) {
    throw new Error(
      `You already have an active blood request (status: ${existingActive.status}). ` +
      'Please wait for it to be processed, or cancel it before submitting a new requisition.'
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

  const parsedUnits = Math.max(1, parseInt(units, 10) || 1);
  const calculatedWeight = weight ? Number(weight) : parsedUnits * 450;
  const resolvedPincode = pincode || seekerUser.pincode || '10001';

  // 3. Create the SeekerRequest with initial status NOT_VERIFIED
  const newRequest = await SeekerRequest.create({
    u_id,
    patient_name: patient_name || seekerUser.name || seekerUser.username || null,
    bloodgroup: resolvedBloodGroup,
    units: parsedUnits,
    weight: calculatedWeight,
    is_emergency: Boolean(is_emergency),
    target_type,
    hospital_id: target_type === 'HOSPITAL' ? hospital_id : null,
    bloodbank_id: target_type === 'BLOOD_BANK' ? bloodbank_id : null,
    pincode: resolvedPincode,
    required_date: required_date ? new Date(required_date) : null,
    seeker_notes,
    status: 'NOT_VERIFIED',
  });

  return SeekerRequest.findById(newRequest._id).populate(POPULATE_SEEKER_REQUEST);
}

/**
 * PHASE 2: Verify seeker medical necessity & credentials (Admin action)
 * Transitions status from 'NOT_VERIFIED' to 'VERIFIED' (or 'REJECTED')
 */
export async function verifySeekerRequest(requestId, {
  admin_id = null,
  is_approved = true,
  verification_notes = null,
  rejection_reason = null,
}) {
  const request = await SeekerRequest.findById(requestId);
  if (!request) {
    throw new Error('Blood request not found');
  }

  if (request.status !== 'NOT_VERIFIED') {
    throw new Error(`Cannot verify request with current status '${request.status}'. Expected 'NOT_VERIFIED'`);
  }

  if (is_approved) {
    request.status = 'VERIFIED';
    request.admin_id = admin_id;
    request.verified_at = new Date();
    request.verification_notes = verification_notes || 'Seeker medical necessity and requisition verified by Admin.';
  } else {
    request.status = 'REJECTED';
    request.admin_id = admin_id;
    request.verified_at = new Date();
    request.rejection_reason = rejection_reason || verification_notes || 'Requisition rejected by Admin.';
  }

  await request.save();
  return SeekerRequest.findById(request._id).populate(POPULATE_SEEKER_REQUEST);
}

/**
 * PHASE 3: Accept request and schedule pickup or delivery (Hospital / BloodBank action)
 * Transitions status from 'VERIFIED' (or 'PENDING') to 'ACCEPTED'
 */
export async function acceptAndScheduleRequest(requestId, {
  institution_id = null,
  schedule_date,
  schedule_time,
  pickup_venue = null,
  scheduling_notes = null,
  staff_id = null,
  allocated_bag_ids = [],
}) {
  if (!schedule_date) {
    throw new Error('Schedule date is required to confirm the blood requisition');
  }
  if (!schedule_time) {
    throw new Error('Schedule time is required to confirm the blood requisition');
  }

  const request = await SeekerRequest.findById(requestId);
  if (!request) {
    throw new Error('Blood request not found');
  }

  if (request.status !== 'VERIFIED' && request.status !== 'PENDING') {
    throw new Error(`Cannot accept request in status '${request.status}'. Request must be 'VERIFIED' or 'PENDING'`);
  }

  // Verify institution ownership if provided
  if (institution_id) {
    const targetMatches =
      (request.target_type === 'HOSPITAL' && request.hospital_id?.toString() === institution_id.toString()) ||
      (request.target_type === 'BLOOD_BANK' && request.bloodbank_id?.toString() === institution_id.toString());

    if (!targetMatches) {
      throw new Error('Unauthorized: This request belongs to a different institution');
    }
  }

  // Resolve staff
  let resolvedStaffId = staff_id;
  if (!resolvedStaffId) {
    const defaultStaff = await Staff.findOne({});
    resolvedStaffId = defaultStaff ? defaultStaff._id : null;
  }

  request.status = 'ACCEPTED';
  request.accepted_at = new Date();
  request.schedule_date = new Date(schedule_date);
  request.schedule_time = schedule_time;
  request.pickup_venue = pickup_venue || 'Hospital Blood Distribution Center';
  request.scheduling_notes = scheduling_notes;
  if (resolvedStaffId) request.staff_id = resolvedStaffId;

  if (Array.isArray(allocated_bag_ids) && allocated_bag_ids.length > 0) {
    request.allocated_bags = allocated_bag_ids;
  }

  await request.save();
  return SeekerRequest.findById(request._id).populate(POPULATE_SEEKER_REQUEST);
}

/**
 * PHASE 4: Complete blood dispatch / fulfillment (Hospital / Staff action)
 * Transitions status from 'ACCEPTED' to 'COMPLETED'
 */
export async function fulfillSeekerRequest(requestId, {
  staff_id = null,
  notes = null,
  allocated_bag_ids = [],
} = {}) {
  const request = await SeekerRequest.findById(requestId).populate('u_id');
  if (!request) {
    throw new Error('Blood request not found');
  }

  if (request.status !== 'ACCEPTED') {
    throw new Error(`Cannot complete blood request with status '${request.status}'. Expected 'ACCEPTED'`);
  }

  let resolvedStaffId = staff_id || request.staff_id;
  if (!resolvedStaffId) {
    const defaultStaff = await Staff.findOne({});
    resolvedStaffId = defaultStaff ? defaultStaff._id : null;
  }

  // Update blood bag allocation if provided
  const bagsToAllot = allocated_bag_ids.length > 0 ? allocated_bag_ids : request.allocated_bags;
  let allotmentDoc = null;

  if (bagsToAllot && bagsToAllot.length > 0) {
    const firstBagId = bagsToAllot[0];
    await BloodBag.findByIdAndUpdate(firstBagId, {
      status: 'ALLOTED',
      isdiscresed: true,
    });

    if (resolvedStaffId) {
      allotmentDoc = await Allotment.create({
        req_id: request._id,
        bag_id: firstBagId,
        s_id: resolvedStaffId,
        date_of_allocation: new Date(),
      }).catch(() => null);
    }
  }

  request.status = 'COMPLETED';
  request.completed_at = new Date();
  if (resolvedStaffId) request.staff_id = resolvedStaffId;
  if (allotmentDoc) request.allotment_id = allotmentDoc._id;
  if (notes) request.scheduling_notes = (request.scheduling_notes ? `${request.scheduling_notes}\n` : '') + notes;

  await request.save();
  return SeekerRequest.findById(request._id).populate(POPULATE_SEEKER_REQUEST);
}

/**
 * Cancel a seeker blood request (Seeker or Institution action)
 */
export async function cancelSeekerRequest(requestId, { user_id = null, reason = 'Cancelled by seeker' } = {}) {
  const request = await SeekerRequest.findById(requestId);
  if (!request) {
    throw new Error('Blood request not found');
  }

  if (request.status === 'COMPLETED') {
    throw new Error('Cannot cancel a blood request that has already been completed');
  }

  if (request.status === 'CANCELLED' || request.status === 'REJECTED') {
    throw new Error(`Request is already in '${request.status}' state`);
  }

  if (user_id && request.u_id.toString() !== user_id.toString()) {
    throw new Error('Unauthorized: You can only cancel your own blood request');
  }

  request.status = 'CANCELLED';
  request.rejection_reason = reason;
  await request.save();

  return SeekerRequest.findById(request._id).populate(POPULATE_SEEKER_REQUEST);
}

/**
 * QUERY: Get single request by ID with all populated details
 */
export async function getSeekerRequestById(requestId) {
  const request = await SeekerRequest.findById(requestId).populate(POPULATE_SEEKER_REQUEST);
  if (!request) {
    throw new Error('Blood request not found');
  }
  return request;
}

/**
 * QUERY: Get all seeker requests submitted by a specific user
 */
export async function getRequestsBySeeker(userId, filter = {}) {
  return SeekerRequest.find({ u_id: userId, ...filter })
    .populate(POPULATE_SEEKER_REQUEST)
    .sort({ createdAt: -1 });
}

/**
 * QUERY: Get the current active (non-terminal) request for a seeker.
 * Returns null if none exists.
 */
export async function getActiveRequestBySeeker(userId) {
  const TERMINAL_STATUSES = ['COMPLETED', 'REJECTED', 'CANCELLED'];
  return SeekerRequest.findOne({
    u_id: userId,
    status: { $nin: TERMINAL_STATUSES },
  }).populate(POPULATE_SEEKER_REQUEST);
}

/**
 * QUERY: Get requests awaiting Admin credential verification
 */
export async function getRequestsPendingVerification(filter = {}) {
  return SeekerRequest.find({ status: 'NOT_VERIFIED', ...filter })
    .populate(POPULATE_SEEKER_REQUEST)
    .sort({ createdAt: -1 });
}

/**
 * QUERY: Get requests for a specific Hospital dashboard
 */
export async function getRequestsForHospital(hospitalId, { status = null } = {}) {
  const query = {
    target_type: 'HOSPITAL',
    hospital_id: hospitalId,
  };

  if (status) {
    query.status = status;
  } else {
    query.status = { $in: ['VERIFIED', 'PENDING', 'ACCEPTED'] };
  }

  return SeekerRequest.find(query)
    .populate(POPULATE_SEEKER_REQUEST)
    .sort({ schedule_date: 1, createdAt: -1 });
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

  return SeekerRequest.find(query)
    .populate(POPULATE_SEEKER_REQUEST)
    .sort({ schedule_date: 1, createdAt: -1 });
}

/**
 * QUERY: List all seeker requests with filtering and pagination
 */
export async function getAllSeekerRequests(filter = {}, { limit = 50, skip = 0 } = {}) {
  const [total, requests] = await Promise.all([
    SeekerRequest.countDocuments(filter),
    SeekerRequest.find(filter)
      .populate(POPULATE_SEEKER_REQUEST)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit)),
  ]);

  return { total, count: requests.length, requests };
}

/**
 * QUERY: Get donor / seeker User profile for form pre-fill
 */
export async function getUserProfile(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

/**
 * Proximity helper: computes blood bag counts available for each institution
 */
async function getInstitutionStock(inventoryId) {
  if (!inventoryId) return { totalUnits: 0, byGroup: {} };
  try {
    const bags = await BloodBag.find({
      I_ID: inventoryId,
      status: 'AVAILABLE',
      isdiscresed: false,
    }).select('bloodgroup');

    const byGroup = {};
    for (const b of bags) {
      byGroup[b.bloodgroup] = (byGroup[b.bloodgroup] || 0) + 1;
    }
    return {
      totalUnits: bags.length,
      byGroup,
    };
  } catch (_e) {
    return { totalUnits: 0, byGroup: {} };
  }
}

/**
 * QUERY: Find nearby hospitals and blood banks using pincode proximity.
 * Algorithm: numeric distance |institution_pincode - user_pincode|.
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
        const stock = await getInstitutionStock(h.I_Id);
        results.push({
          _id: h._id,
          name: h.hos_name,
          institution_type: 'HOSPITAL',
          pincode: h.pincode,
          phone: h.phone || null,
          email: h.email || null,
          address: h.address || null,
          distance_score: score,
          totalUnits: stock.totalUnits,
          stockByGroup: stock.byGroup,
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
        const stock = await getInstitutionStock(bb.I_Id);
        results.push({
          _id: bb._id,
          name: bb.bank_name,
          institution_type: 'BLOOD_BANK',
          pincode: bb.pincode,
          phone: bb.contact_no || null,
          email: bb.email || null,
          address: bb.address || null,
          distance_score: score,
          totalUnits: stock.totalUnits,
          stockByGroup: stock.byGroup,
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
      // fallback
    }
  }
  return null;
}

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
      select: 'hos_name pincode phone email address latitude longitude geocodeAttemptedAt I_Id',
      nameKey: 'hos_name',
      phoneKey: 'phone',
    });
  }
  if (type === 'ALL' || type === 'BLOOD_BANK') {
    sources.push({
      Model: BloodBank,
      institution_type: 'BLOOD_BANK',
      select: 'bank_name pincode contact_no email address latitude longitude geocodeAttemptedAt I_Id',
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
      const stock = await getInstitutionStock(d.I_Id);
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
        totalUnits: stock.totalUnits,
        stockByGroup: stock.byGroup,
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
  createSeekerRequest,
  verifySeekerRequest,
  acceptAndScheduleRequest,
  fulfillSeekerRequest,
  cancelSeekerRequest,
  getSeekerRequestById,
  getRequestsBySeeker,
  getActiveRequestBySeeker,
  getRequestsPendingVerification,
  getRequestsForHospital,
  getRequestsForBloodBank,
  getAllSeekerRequests,
  getUserProfile,
  getNearbyInstitutions,
  getNearbyInstitutionsByLocation,
};
