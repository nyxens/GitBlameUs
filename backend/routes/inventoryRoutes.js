import { getStock, getInventoryItems, fulfillInventoryItem } from '../controllers/inventoryController.js';

export function setupInventoryRoutes(router) {
  router.get('/inventory/stock', getStock);
  router.get('/inventory/items', getInventoryItems);
  router.put('/inventory/fulfill/:id', fulfillInventoryItem);
  router.post('/inventory/fulfill/:id', fulfillInventoryItem);
}
