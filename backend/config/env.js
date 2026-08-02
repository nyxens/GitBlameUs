export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-lifevault-key-2026',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/lifevault_bbms',
};
