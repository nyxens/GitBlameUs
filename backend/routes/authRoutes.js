import { login } from '../controllers/authController.js';

export function setupAuthRoutes(router) {
  router.post('/auth/login', login);
}
