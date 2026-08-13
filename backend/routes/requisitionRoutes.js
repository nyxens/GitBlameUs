import { createRequisition } from '../controllers/requisitionController.js';

export function setupRequisitionRoutes(router) {
  router.post('/requisitions', createRequisition);
}
