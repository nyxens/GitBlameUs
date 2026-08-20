import bcrypt from 'bcrypt';
import { connectDB } from './config/db.js';
import { User } from './models/index.js';

const ADMIN_CREDENTIALS = {
  email: 'admin@lifevault.org',
  password: 'LifeVaultAdmin2026!',
  name: 'LifeVault Master Admin',
  role: 'SUPER_ADMIN',
  phone: '+1-800-555-0199',
  city: 'New York',
  isVerified: true,
  status: 'ACTIVE',
};

async function createOrUpdateMasterAdmin() {
  console.log('[LifeVault] Connecting to MongoDB...');
  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Could not establish connection to MongoDB. Check MONGO_URI in .env');
    process.exit(1);
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, saltRounds);

  console.log(`[LifeVault] Checking if user ${ADMIN_CREDENTIALS.email} exists...`);
  let user = await User.findOne({ email: ADMIN_CREDENTIALS.email });

  if (user) {
    console.log('[LifeVault] Master Admin already exists. Updating credentials and status...');
    user.name = ADMIN_CREDENTIALS.name;
    user.password = passwordHash;
    user.role = ADMIN_CREDENTIALS.role;
    user.phone = ADMIN_CREDENTIALS.phone;
    user.city = ADMIN_CREDENTIALS.city;
    user.isVerified = ADMIN_CREDENTIALS.isVerified;
    user.status = ADMIN_CREDENTIALS.status;
    await user.save();
  } else {
    console.log('[LifeVault] Creating new Master Admin user...');
    user = await User.create({
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      password: passwordHash,
      role: ADMIN_CREDENTIALS.role,
      phone: ADMIN_CREDENTIALS.phone,
      city: ADMIN_CREDENTIALS.city,
      isVerified: ADMIN_CREDENTIALS.isVerified,
      status: ADMIN_CREDENTIALS.status,
    });
  }

  console.log('----------------------------------------------------');
  console.log('✅ Master Admin Account Successfully Verified in MongoDB:');
  console.log(`   ID:         ${user._id}`);
  console.log(`   Name:       ${user.name}`);
  console.log(`   Email:      ${user.email}`);
  console.log(`   Role:       ${user.role}`);
  console.log(`   Verified:   ${user.isVerified}`);
  console.log(`   Status:     ${user.status}`);
  console.log(`   CreatedAt:  ${user.createdAt}`);
  console.log('----------------------------------------------------');

  // Perform a fresh retrieval from MongoDB to prove existence
  const queriedUser = await User.findById(user._id).lean();
  console.log('[LifeVault MongoDB Confirmation Query Output]:', queriedUser);

  process.exit(0);
}

createOrUpdateMasterAdmin().catch((err) => {
  console.error('❌ Error creating Master Admin:', err);
  process.exit(1);
});
