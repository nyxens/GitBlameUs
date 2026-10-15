import { listAccounts, createAccount, updateAccount, deleteAccount } from '../controllers/accountController.js';
import { authMiddleware, resolveScope, requireOrgAdmin } from '../middleware/authMiddleware.js';

export function setupAccountRoutes(router) {
  const guard = [authMiddleware, resolveScope, requireOrgAdmin];
  router.get('/accounts', ...guard, listAccounts);
  router.post('/accounts', ...guard, createAccount);
  router.put('/accounts/:id', ...guard, updateAccount);
  router.delete('/accounts/:id', ...guard, deleteAccount);
}
