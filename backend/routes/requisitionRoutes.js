import { RequisitionController } from '../controllers/requisitionController.js';

export function setupRequisitionRoutes(router) {
  router.post('/requisitions', RequisitionController.createRequisition);
}
