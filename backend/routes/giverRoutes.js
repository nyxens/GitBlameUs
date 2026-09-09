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
} from '../controllers/giverController.js';

export function setupGiverRoutes(router) {
  // Phase 1: Donor submits donation request
  router.post('/giver/request', applyDonationRequest);

  // Phase 2: Admin verifies donor credentials
  router.put('/giver/request/:id/verify', verifyDonationRequest);

  // Phase 3: Hospital/BloodBank accepts & schedules appointment
  router.put('/giver/request/:id/schedule', acceptAndScheduleDonation);

  // Phase 4: Hospital marks donation as complete
  router.post('/giver/request/:id/complete', completeDonation);

  // Cancel a donation request
  router.put('/giver/request/:id/cancel', cancelDonationRequest);

  // Query: Single request by ID
  router.get('/giver/request/:id', getRequestDetails);

  // Query: All requests by logged-in donor
  router.get('/giver/my-requests', getMyRequests);

  // Query: Pending admin verifications
  router.get('/giver/admin/pending', getPendingAdminVerifications);

  // Query: Requests for a specific hospital
  router.get('/giver/hospital/:hospitalId', getHospitalRequests);

  // Query: Requests for a specific blood bank
  router.get('/giver/bloodbank/:bloodbankId', getBloodBankRequests);

  // Query: All requests with filtering & pagination
  router.get('/giver/requests', getAllRequests);
}
