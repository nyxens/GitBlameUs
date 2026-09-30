import { getHistory } from '../controllers/historyController.js';

export function setupHistoryRoutes(router) {
  router.get('/history', getHistory);
}
