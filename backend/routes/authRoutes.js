const express = require('express');
const router = express.Router();

import { login, signup, refresh, logout } from '../controllers Controller.js';


  router.post('/signup', signup);
  router.post('/login', login);
  router.post('/refresh', refresh);
  router.post('/logout', logout);

  export default router;
