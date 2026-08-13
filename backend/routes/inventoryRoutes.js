import { getStock } from '../controllers/inventoryController.js';

export function setupInventoryRoutes(router) {
  router.get('/inventory/stock', getStock);
}
