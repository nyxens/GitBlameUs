import { DonorController } from '../controllers/donorController.js';

export function setupDonorRoutes(router) {
  router.post('/donors/schedule', DonorController.scheduleDonation);
}
