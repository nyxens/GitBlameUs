import { authenticateHospital, getHospitals, createHospital, deleteHospital } from '../controllers/hospitalController.js';
import { authMiddleware, requireAdmin, resolveScope } from '../middleware/authMiddleware.js';

export function setupHospitalRoutes(router) {
  router.post('/hospitals/auth', authenticateHospital);
  router.get('/hospitals', authMiddleware, resolveScope, getHospitals);
  router.post('/hospitals', authMiddleware, requireAdmin, createHospital);
  router.delete('/hospitals/:id', authMiddleware, requireAdmin, deleteHospital);
}
