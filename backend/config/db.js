import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  if (!config.mongoUri) {
    console.error('[Database Error] MONGO_URI is missing in environment configuration.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
}

