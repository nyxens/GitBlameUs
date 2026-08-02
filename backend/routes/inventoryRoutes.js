import { InventoryController } from '../controllers/inventoryController.js';

export function setupInventoryRoutes(router) {
  router.get('/inventory/stock', InventoryController.getStock);
}
