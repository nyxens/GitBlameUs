import { authMiddleware, resolveScope } from '../middleware/authMiddleware.js';
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
  router.get('/requisitions', authMiddleware, resolveScope, getRequisitions);
  router.get('/requisitions/candidate-bags', authMiddleware, resolveScope, getCandidateBags);
  router.put('/requisitions/:id/accept', authMiddleware, resolveScope, acceptRequisition);
  router.post('/requisitions/:id/accept', authMiddleware, resolveScope, acceptRequisition);
  router.put('/requisitions/:id/allocate', authMiddleware, resolveScope, allocateRequisition);
  router.post('/requisitions/:id/allocate', authMiddleware, resolveScope, allocateRequisition);
  router.put('/requisitions/:id/deny', authMiddleware, resolveScope, denyRequisition);
  router.post('/requisitions/:id/deny', authMiddleware, resolveScope, denyRequisition);
  router.delete('/requisitions/:id', authMiddleware, resolveScope, deleteRequisition);
}
