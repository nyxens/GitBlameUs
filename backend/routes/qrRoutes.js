import { getMyQr, resolveQr } from '../controllers/qrController.js';
import { authMiddleware, resolveScope } from '../middleware/authMiddleware.js';

export function setupQrRoutes(router) {
  router.get('/qr/me', authMiddleware, getMyQr);
  // resolveScope = master admin or an organization member; plain users get 403
  router.post('/qr/resolve', authMiddleware, resolveScope, resolveQr);
}
