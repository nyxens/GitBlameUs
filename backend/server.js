import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

// Allow credentials (cookies) from the frontend origin
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. same-origin, curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));
app.use(cookieParser());
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
