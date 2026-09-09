import { scheduleDonation, getDonors } from '../controllers/donorController.js';

export function setupDonorRoutes(router) {
  router.post('/donors/schedule', scheduleDonation);
  router.get('/donors', getDonors);
}
