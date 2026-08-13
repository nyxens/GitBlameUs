import { scheduleDonation } from '../controllers/donorController.js';

export function setupDonorRoutes(router) {
  router.post('/donors/schedule', scheduleDonation);
}
