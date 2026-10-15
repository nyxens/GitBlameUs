import { scheduleDonation, getDonors } from '../controllers/donorController.js';
import { authMiddleware, resolveScope } from '../middleware/authMiddleware.js';

export function setupDonorRoutes(router) {
  router.post('/donors/schedule', scheduleDonation);
  router.get('/donors', authMiddleware, resolveScope, getDonors);
}
