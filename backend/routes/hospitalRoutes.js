import { authenticateHospital } from '../controllers/hospitalController.js';

export function setupHospitalRoutes(router) {
  router.post('/hospitals/auth', authenticateHospital);
}
