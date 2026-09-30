import {
  getStock,
  getInventoryItems,
  fulfillInventoryItem,
  getInventoriesByPincode,
} from '../controllers/inventoryController.js';

export function setupInventoryRoutes(router) {
  router.get('/inventory/stock', getStock);
  router.get('/inventory/items', getInventoryItems);
  router.get('/inventory/by-pincode', getInventoriesByPincode);
  router.get('/inventory/by-pincode/:pincode', getInventoriesByPincode);
  router.put('/inventory/fulfill/:id', fulfillInventoryItem);
  router.post('/inventory/fulfill/:id', fulfillInventoryItem);
}
