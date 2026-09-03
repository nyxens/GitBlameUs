import { createRequisition, getRequisitions } from '../controllers/requisitionController.js';

export function setupRequisitionRoutes(router) {
  router.post('/requisitions', createRequisition);
  router.get('/requisitions', getRequisitions);
}
