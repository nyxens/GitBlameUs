import {
  applyDonationRequest,
  verifyDonationRequest,
  acceptAndScheduleDonation,
  completeDonation,
  cancelDonationRequest,
  getRequestDetails,
  getMyRequests,
  getPendingAdminVerifications,
  getHospitalRequests,
  getBloodBankRequests,
  getAllRequests,
  getDonorProfile,
  getActiveRequest,
  getNearbyInstitutions,
} from '../controllers/giverController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
// import { donorOnlyMiddleware } from '../middleware/donorOnlyMiddleware.js'; // TODO: create when role gating is ready

export function setupGiverRoutes(router) {
  // ── Donor-facing: Find nearby institutions & form pre-fill ──────────────────

  // GET /giver/nearby?pincode=&type=ALL|HOSPITAL|BLOOD_BANK&radius=5|10|25|50
  router.get('/giver/nearby',
    authMiddleware,            // populates req.user (non-blocking — cookie optional)
    // donorOnlyMiddleware,   // Uncomment to restrict to DONOR/SEEKER role
    getNearbyInstitutions
  );

  // GET /giver/donor-profile — returns logged-in user's profile for form pre-fill
  router.get('/giver/donor-profile',
    authMiddleware,
    getDonorProfile
  );

  // GET /giver/active-request — returns current non-terminal request for logged-in donor
  router.get('/giver/active-request',
    authMiddleware,
    getActiveRequest
  );

  // ── Phase 1: Donor submits donation request ─────────────────────────────────
  router.post('/giver/request',
    // authMiddleware,
    // donorOnlyMiddleware,
    applyDonationRequest
  );

  // ── Phase 2: Admin verifies donor credentials ────────────────────────────────
  router.put('/giver/request/:id/verify', verifyDonationRequest);

  // ── Phase 3: Hospital/BloodBank accepts & schedules appointment ──────────────
  router.put('/giver/request/:id/schedule', acceptAndScheduleDonation);

  // ── Phase 4: Hospital marks donation as complete ─────────────────────────────
  router.post('/giver/request/:id/complete', completeDonation);

  // ── Cancel a donation request ────────────────────────────────────────────────
  router.put('/giver/request/:id/cancel',
    // authMiddleware,
    cancelDonationRequest
  );

  // ── Queries ──────────────────────────────────────────────────────────────────

  // Single request by ID
  router.get('/giver/request/:id', getRequestDetails);

  // All requests by logged-in donor
  router.get('/giver/my-requests',
    // authMiddleware,
    getMyRequests
  );

  // Pending admin verifications
  router.get('/giver/admin/pending', getPendingAdminVerifications);

  // Requests for a specific hospital
  router.get('/giver/hospital/:hospitalId', getHospitalRequests);

  // Requests for a specific blood bank
  router.get('/giver/bloodbank/:bloodbankId', getBloodBankRequests);

  // All requests with filtering & pagination
  router.get('/giver/requests', getAllRequests);
}
