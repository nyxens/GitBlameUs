import mongoose from 'mongoose';
import { getConfig } from './env.js';

export async function connectDB() {
  const config = getConfig();
  if (!config.mongoUri) {
    console.error('[Database Error] MONGO_URI is missing in environment configuration.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
}

