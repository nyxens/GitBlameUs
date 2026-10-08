import {
  applySeekerRequest,
  verifySeekerRequest,
  acceptAndScheduleSeekerRequest,
  fulfillSeekerRequest,
  cancelSeekerRequest,
  deleteSeekerRequest,
  getRequestDetails,
  getMyRequests,
  getPendingAdminVerifications,
  getHospitalRequests,
  getBloodBankRequests,
  getAllRequests,
  getSeekerProfile,
  getActiveRequest,
  getNearbyInstitutions,
} from '../controllers/seekerController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';

export function setupSeekerRoutes(router) {
  // ── Seeker-facing: Find nearby institutions & form pre-fill ──────────────────

  // GET /seeker/nearby?pincode=&type=ALL|HOSPITAL|BLOOD_BANK&radius=5|10|25|50
  // or /seeker/nearby?lat=&lng=&type=&radius=
  router.get(
    '/seeker/nearby',
    optionalAuthMiddleware,
    getNearbyInstitutions
  );

  // GET /seeker/seeker-profile — returns logged-in seeker's profile for form pre-fill
  router.get(
    '/seeker/seeker-profile',
    optionalAuthMiddleware,
    getSeekerProfile
  );

  // GET /seeker/active-request — returns current non-terminal request for logged-in seeker
  router.get(
    '/seeker/active-request',
    optionalAuthMiddleware,
    getActiveRequest
  );

  // ── Phase 1: Seeker submits blood request ─────────────────────────────────────
  router.post(
    '/seeker/request',
    optionalAuthMiddleware,
    applySeekerRequest
  );

  // ── Phase 2: Admin verifies blood request credentials / medical necessity ──────
  router.put('/seeker/request/:id/verify', verifySeekerRequest);

  // ── Phase 3: Hospital/BloodBank accepts & schedules pickup/dispatch ───────────
  router.put('/seeker/request/:id/schedule', acceptAndScheduleSeekerRequest);

  // ── Phase 4: Hospital fulfills blood requisition ─────────────────────────────
  router.put('/seeker/request/:id/fulfill', fulfillSeekerRequest);
  router.post('/seeker/request/:id/fulfill', fulfillSeekerRequest);

  // ── Cancel a seeker blood request ────────────────────────────────────────────
  router.put(
    '/seeker/request/:id/cancel',
    optionalAuthMiddleware,
    cancelSeekerRequest
  );

  // ── Delete a seeker blood request ────────────────────────────────────────────
  router.delete(
    '/seeker/request/:id',
    optionalAuthMiddleware,
    deleteSeekerRequest
  );

  // ── Queries ──────────────────────────────────────────────────────────────────

  // Single request by ID
  router.get('/seeker/request/:id', getRequestDetails);

  // All requests by logged-in seeker
  router.get(
    '/seeker/my-requests',
    optionalAuthMiddleware,
    getMyRequests
  );

  // Pending admin verifications
  router.get('/seeker/admin/pending', getPendingAdminVerifications);

  // Requests for a specific hospital
  router.get('/seeker/hospital/:hospitalId', getHospitalRequests);

  // Requests for a specific blood bank
  router.get('/seeker/bloodbank/:bloodbankId', getBloodBankRequests);

  // All requests with filtering & pagination
  router.get('/seeker/requests', getAllRequests);
}

export default setupSeekerRoutes;
