import { connectDB } from './config/db.js';
import { User, Donor, Hospital, InventoryItem, Requisition } from './models/index.js';

async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await User.deleteMany({});
  await Donor.deleteMany({});
  await Hospital.deleteMany({});
  await InventoryItem.deleteMany({});
  await Requisition.deleteMany({});

  console.log('[Seed] Inserting Users...');
  const users = await User.create([
    {
      name: 'System Admin',
      email: 'admin@lifevault.org',
      role: 'ADMIN',
      phone: '+1-555-0100',
      city: 'Metropolis',
    },
    {
      name: 'Apex City Hospital',
      email: 'contact@apexcityhospital.org',
      role: 'HOSPITAL',
      phone: '+1-555-0200',
      hospitalName: 'Apex City Medical Center',
      licenseId: 'HOSP-LIC-2026-9901',
      city: 'New York',
    },
    {
      name: 'St. Jude Telemetry Care',
      email: 'emergency@stjude-care.org',
      role: 'HOSPITAL',
      phone: '+1-555-0300',
      hospitalName: 'St. Jude Telemetry Care',
      licenseId: 'HOSP-LIC-2026-4422',
      city: 'Chicago',
    },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'DONOR',
      phone: '+1-555-0401',
      bloodGroup: 'O-',
      city: 'New York',
    },
    {
      name: 'Sarah Connor',
      email: 'sarah.c@example.com',
      role: 'DONOR',
      phone: '+1-555-0402',
      bloodGroup: 'O+',
      city: 'Chicago',
    },
    {
      name: 'Michael Scott',
      email: 'm.scott@example.com',
      role: 'DONOR',
      phone: '+1-555-0403',
      bloodGroup: 'A+',
      city: 'Scranton',
    },
  ]);

  console.log('[Seed] Inserting Hospitals...');
  const hospitals = await Hospital.create([
    {
      userId: users[1]._id,
      name: 'Apex City Medical Center',
      licenseId: 'HOSP-LIC-2026-9901',
      city: 'New York',
      networkNode: 'NODE-NY-NORTH-01',
      isVerified: true,
    },
    {
      userId: users[2]._id,
      name: 'St. Jude Telemetry Care',
      licenseId: 'HOSP-LIC-2026-4422',
      city: 'Chicago',
      networkNode: 'NODE-CHI-EAST-04',
      isVerified: true,
    },
  ]);

  console.log('[Seed] Inserting Donors...');
  await Donor.create([
    {
      userId: users[3]._id,
      name: 'John Doe',
      phone: '+1-555-0401',
      email: 'john.doe@example.com',
      bloodGroup: 'O-',
      city: 'New York',
      weightKg: 78,
      isEligible: true,
      totalDonationsCount: 5,
      lastDonationDate: new Date('2026-05-10'),
    },
    {
      userId: users[4]._id,
      name: 'Sarah Connor',
      phone: '+1-555-0402',
      email: 'sarah.c@example.com',
      bloodGroup: 'O+',
      city: 'Chicago',
      weightKg: 62,
      isEligible: true,
      totalDonationsCount: 12,
      lastDonationDate: new Date('2026-06-15'),
    },
    {
      userId: users[5]._id,
      name: 'Michael Scott',
      phone: '+1-555-0403',
      email: 'm.scott@example.com',
      bloodGroup: 'A+',
      city: 'Scranton',
      weightKg: 75,
      isEligible: false,
      totalDonationsCount: 2,
      lastDonationDate: new Date('2026-07-20'),
    },
  ]);

  console.log('[Seed] Inserting Inventory Items...');
  const now = new Date();
  await InventoryItem.create([
    {
      unitBarcode: 'LV-UNIT-2026-001',
      bloodGroup: 'O-',
      component: 'WHOLE_BLOOD',
      volumeMl: 450,
      collectionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-ALPHA-01',
      storageTemperature: 4.2,
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-002',
      bloodGroup: 'O-',
      component: 'RBC',
      volumeMl: 300,
      collectionDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-ALPHA-02',
      storageTemperature: 3.9,
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-003',
      bloodGroup: 'O+',
      component: 'WHOLE_BLOOD',
      volumeMl: 500,
      collectionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 33 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-BETA-01',
      storageTemperature: 4.0,
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-004',
      bloodGroup: 'A+',
      component: 'PLATELETS',
      volumeMl: 250,
      collectionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-CRYO-03',
      storageTemperature: 22.0,
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-005',
      bloodGroup: 'B-',
      component: 'PLASMA',
      volumeMl: 200,
      collectionDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 350 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-FREEZER-01',
      storageTemperature: -18.5,
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-006',
      bloodGroup: 'AB+',
      component: 'WHOLE_BLOOD',
      volumeMl: 450,
      collectionDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-BETA-02',
      storageTemperature: 4.1,
      status: 'RESERVED',
    },
  ]);

  console.log('[Seed] Inserting Requisitions...');
  await Requisition.create([
    {
      hospital: hospitals[0]._id,
      hospitalName: 'Apex City Medical Center',
      bloodGroup: 'O-',
      unitsRequested: 4,
      urgencyLevel: 'CRITICAL',
      status: 'PENDING',
      requestedAt: new Date(),
    },
    {
      hospital: hospitals[1]._id,
      hospitalName: 'St. Jude Telemetry Care',
      bloodGroup: 'A+',
      unitsRequested: 2,
      urgencyLevel: 'NORMAL',
      status: 'APPROVED',
      requestedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('✅ Seed completed successfully! All collections populated.');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
