import {
  getStock,
  getInventoryItems,
  getInventoryFacilities,
  addBloodBag,
  discardBloodBag,
  fulfillInventoryItem,
  getInventoriesByPincode,
} from '../controllers/inventoryController.js';

import { authMiddleware, resolveScope } from '../middleware/authMiddleware.js';

export function setupInventoryRoutes(router) {
  router.get('/inventory/stock', authMiddleware, resolveScope, getStock);
  router.get('/inventory/facilities', authMiddleware, resolveScope, getInventoryFacilities);
  router.post('/inventory/bags', authMiddleware, resolveScope, addBloodBag);
  router.put('/inventory/bags/:id/discard', authMiddleware, resolveScope, discardBloodBag);
  router.get('/inventory/items', authMiddleware, resolveScope, getInventoryItems);
  router.get('/inventory/by-pincode', getInventoriesByPincode);
  router.get('/inventory/by-pincode/:pincode', getInventoriesByPincode);
  router.put('/inventory/fulfill/:id', authMiddleware, resolveScope, fulfillInventoryItem);
  router.post('/inventory/fulfill/:id', authMiddleware, resolveScope, fulfillInventoryItem);
}
