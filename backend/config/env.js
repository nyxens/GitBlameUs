import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export function getConfig() {
  return {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-lifevault-key-2026',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-lifevault-refresh-key-2026',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/lifevault_bbms',
  };
}

export const config = getConfig();

