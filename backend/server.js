import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { setupAuthRoutes } from './routes/authRoutes.js';
import { setupDonorRoutes } from './routes/donorRoutes.js';
import { setupHospitalRoutes } from './routes/hospitalRoutes.js';
import { setupInventoryRoutes } from './routes/inventoryRoutes.js';
import { setupRequisitionRoutes } from './routes/requisitionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

const router = express.Router();
setupAuthRoutes(router);
setupDonorRoutes(router);
setupHospitalRoutes(router);
setupInventoryRoutes(router);
setupRequisitionRoutes(router);

app.use('/api/v1', router);

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', server: 'LifeVault BBMS Express Backend Server', timestamp: new Date() });
});

app.use(errorHandler);

async function startServer() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[Server] LifeVault BBMS Express API listening on port ${config.port} (${config.nodeEnv})`);
  });
}

startServer();
