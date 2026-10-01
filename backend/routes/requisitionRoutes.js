import {
  createRequisition,
  getRequisitions,
  acceptRequisition,
  allocateRequisition,
  denyRequisition,
  getCandidateBags,
  deleteRequisition,
} from '../controllers/requisitionController.js';

export function setupRequisitionRoutes(router) {
  router.post('/requisitions', createRequisition);
  router.get('/requisitions', getRequisitions);
  router.get('/requisitions/candidate-bags', getCandidateBags);
  router.put('/requisitions/:id/accept', acceptRequisition);
  router.post('/requisitions/:id/accept', acceptRequisition);
  router.put('/requisitions/:id/allocate', allocateRequisition);
  router.post('/requisitions/:id/allocate', allocateRequisition);
  router.put('/requisitions/:id/deny', denyRequisition);
  router.post('/requisitions/:id/deny', denyRequisition);
  router.delete('/requisitions/:id', deleteRequisition);
}
