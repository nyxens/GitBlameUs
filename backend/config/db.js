import { getConfig } from './env.js';

export async function connectDB() {
  const config = getConfig();
  console.log(`[Database] Connecting to database at ${config.mongoUri}...`);
  // DB connection initialization
}
