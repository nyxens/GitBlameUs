import express from 'express';
import cors from 'cors';
import { getConfig } from './config/env.js';
import { connectDB } from './config/db.js';
import { setupDonorRoutes } from './routes/donorRoutes.js';
import { setupHospitalRoutes } from './routes/hospitalRoutes.js';
import { setupInventoryRoutes } from './routes/inventoryRoutes.js';
import { setupRequisitionRoutes } from './routes/requisitionRoutes.js';
import { setupGiverRoutes } from './routes/giverRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const config = getConfig();

// Resilient cookie parser: use package if available, else simple fallback
let cookieParserMiddleware;
try {
  const cp = (await import('cookie-parser')).default;
  cookieParserMiddleware = cp();
} catch (_err) {
  cookieParserMiddleware = (req, _res, next) => {
    req.cookies = req.cookies || {};
    const header = req.headers?.cookie;
    if (header) {
      header.split(';').forEach((c) => {
        const [k, ...v] = c.trim().split('=');
        if (k) req.cookies[k] = decodeURIComponent(v.join('='));
      });
    }
    next();
  };
}

// Allow credentials (cookies) from any localhost/127.0.0.1 dev port
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    cb(null, false);
  },
  credentials: true,
}));
app.use(cookieParserMiddleware);
app.use(express.json());

const router = express.Router();
setupDonorRoutes(router);
setupHospitalRoutes(router);
setupInventoryRoutes(router);
setupRequisitionRoutes(router);
setupGiverRoutes(router);

app.use('/api/v1', router);
app.use('/api', router);
app.use('/', router);
app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', server: 'LifeVault BBMS Express Backend Server', timestamp: new Date() });
});

app.use(errorHandler);

async function startServer() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[Server] LifeVault BBMS Express API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });
}

startServer();