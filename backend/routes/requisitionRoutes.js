import { createRequisition, getRequisitions, deleteRequisition } from '../controllers/requisitionController.js';

export function setupRequisitionRoutes(router) {
  router.post('/requisitions', createRequisition);
  router.get('/requisitions', getRequisitions);
  router.delete('/requisitions/:id', deleteRequisition);
}

