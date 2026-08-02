import { config } from './env.js';

export async function connectDB() {
  console.log(`[Database] Connecting to database at ${config.mongoUri}...`);
  // DB connection initialization
}
