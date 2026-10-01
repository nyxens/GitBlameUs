import mongoose from 'mongoose';
import { getConfig } from './env.js';

export async function connectDB() {
  const config = getConfig();
  if (!config.mongoUri) {
    console.warn('[Database] MONGO_URI is missing in environment configuration. Running without DB connection.');
    return null;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 15000 });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Could not connect to MongoDB (${error.message}). Running server with fallback.`);
    return null;
  }
}

export default connectDB;
