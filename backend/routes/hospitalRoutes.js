import { HospitalController } from '../controllers/hospitalController.js';

export function setupHospitalRoutes(router) {
  router.post('/hospitals/auth', HospitalController.authenticate);
}
