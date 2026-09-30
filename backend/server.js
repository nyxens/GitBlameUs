import express from 'express';
import cors from 'cors';
import { getConfig } from './config/env.js';
import { connectDB } from './config/db.js';
import { setupDonorRoutes } from './routes/donorRoutes.js';
import { setupHospitalRoutes } from './routes/hospitalRoutes.js';
import { setupInventoryRoutes } from './routes/inventoryRoutes.js';
import { setupRequisitionRoutes } from './routes/requisitionRoutes.js';
import { setupGiverRoutes } from './routes/giverRoutes.js';
import { setupSeekerRoutes } from './routes/seekerRoutes.js';
import { setupHistoryRoutes } from './routes/historyRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

import cookieParser from 'cookie-parser';

const app = express();
const config = getConfig();

// Allow credentials (cookies) from any localhost/127.0.0.1/LAN dev port or same-origin
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }
    cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-refresh-token'],
  exposedHeaders: ['x-access-token'],
}));

app.use(cookieParser());
// Fallback cookie extractor in case of atypical header format
app.use((req, _res, next) => {
  req.cookies = req.cookies || {};
  if (Object.keys(req.cookies).length === 0 && req.headers?.cookie) {
    req.headers.cookie.split(';').forEach((c) => {
      const [k, ...v] = c.trim().split('=');
      if (k) req.cookies[k] = decodeURIComponent(v.join('='));
    });
  }
  next();
});
app.use(express.json());

const router = express.Router();
setupDonorRoutes(router);
setupHospitalRoutes(router);
setupInventoryRoutes(router);
setupRequisitionRoutes(router);
setupGiverRoutes(router);
setupSeekerRoutes(router);
setupHistoryRoutes(router);

// Mount authentication routes first
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Mount core business API routes
app.use('/api/v1', router);
app.use('/api', router);
app.use('/', router);

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ status: 'OK', server: 'LifeVault BBMS Express Backend Server', timestamp: new Date() });
});

app.use(errorHandler);

async function startServer() {
  await connectDB();
  const server = app.listen(config.port, () => {
    console.log(`[Server] LifeVault BBMS Express API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Server Error] Port ${config.port} is already in use. Please free port ${config.port} or configure a different PORT.`);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

startServer();