import { getHistory } from '../controllers/historyController.js';
import { authMiddleware, resolveScope } from '../middleware/authMiddleware.js';

export function setupHistoryRoutes(router) {
  router.get('/history', authMiddleware, resolveScope, getHistory);
}
