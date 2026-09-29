import { authenticateHospital, getHospitals } from '../controllers/hospitalController.js';

export function setupHospitalRoutes(router) {
  router.post('/hospitals/auth', authenticateHospital);
  router.get('/hospitals', getHospitals);
}
