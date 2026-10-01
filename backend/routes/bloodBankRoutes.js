import { getBloodBanks, createBloodBank, deleteBloodBank } from '../controllers/bloodBankController.js';
import { authMiddleware, requireAdmin, resolveScope } from '../middleware/authMiddleware.js';

export function setupBloodBankRoutes(router) {
  router.get('/bloodbanks', authMiddleware, resolveScope, getBloodBanks);
  router.post('/bloodbanks', authMiddleware, requireAdmin, createBloodBank);
  router.delete('/bloodbanks/:id', authMiddleware, requireAdmin, deleteBloodBank);
}
