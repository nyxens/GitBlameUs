import { connectDB } from './config/db.js';
import {
  User,
  Donor,
  Hospital,
  BloodBank,
  Patient,
  InventoryItem,
  Requisition,
  Appointment,
  DonationDrive,
  LabScreening,
} from './models/index.js';

async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Donor.deleteMany({}),
    Hospital.deleteMany({}),
    BloodBank.deleteMany({}),
    Patient.deleteMany({}),
    InventoryItem.deleteMany({}),
    Requisition.deleteMany({}),
    Appointment.deleteMany({}),
    DonationDrive.deleteMany({}),
    LabScreening.deleteMany({}),
  ]);

  console.log('[Seed] Inserting Users...');
  const users = await User.create([
    {
      name: 'System Admin',
      email: 'admin@lifevault.org',
      role: 'SUPER_ADMIN',
      phone: '+1-555-0100',
      city: 'Metropolis',
      isVerified: true,
    },
    {
      name: 'Apex City Hospital Staff',
      email: 'contact@apexcityhospital.org',
      role: 'DOCTOR',
      phone: '+1-555-0200',
      hospitalName: 'Apex City Medical Center',
      licenseId: 'HOSP-LIC-2026-9901',
      city: 'New York',
      isVerified: true,
    },
    {
      name: 'St. Jude Telemetry Care Staff',
      email: 'emergency@stjude-care.org',
      role: 'DOCTOR',
      phone: '+1-555-0300',
      hospitalName: 'St. Jude Telemetry Care',
      licenseId: 'HOSP-LIC-2026-4422',
      city: 'Chicago',
      isVerified: true,
    },
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'DONOR',
      phone: '+1-555-0401',
      bloodGroup: 'O-',
      city: 'New York',
      isVerified: true,
    },
    {
      name: 'Sarah Connor',
      email: 'sarah.c@example.com',
      role: 'DONOR',
      phone: '+1-555-0402',
      bloodGroup: 'O+',
      city: 'Chicago',
      isVerified: true,
    },
    {
      name: 'Michael Scott',
      email: 'm.scott@example.com',
      role: 'DONOR',
      phone: '+1-555-0403',
      bloodGroup: 'A+',
      city: 'Scranton',
      isVerified: true,
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'PATIENT',
      phone: '+1-555-0501',
      bloodGroup: 'B-',
      city: 'New York',
      isVerified: true,
    },
  ]);

  console.log('[Seed] Inserting Blood Banks...');
  const bloodBanks = await BloodBank.create([
    {
      code: 'BB-NY-CENTRAL-01',
      name: 'Metropolitan Red Life Vault',
      licenseNumber: 'BB-LIC-NY-2026-001',
      city: 'New York',
      contactNumber: '+1-555-7001',
      email: 'central@metrolifevault.org',
      operatingHours: '24/7',
      storageCapacityUnits: 10000,
      activeAlertsCount: 0,
      address: {
        street: '450 Lexington Ave',
        city: 'New York',
        state: 'NY',
        pincode: '10017',
        coordinates: { lat: 40.7527, lng: -73.9772 },
      },
    },
    {
      code: 'BB-CHI-EAST-02',
      name: 'Great Lakes Regional Blood Center',
      licenseNumber: 'BB-LIC-IL-2026-002',
      city: 'Chicago',
      contactNumber: '+1-555-7002',
      email: 'contact@greatlakesblood.org',
      operatingHours: '24/7',
      storageCapacityUnits: 7500,
      activeAlertsCount: 0,
      address: {
        street: '200 E Michigan Ave',
        city: 'Chicago',
        state: 'IL',
        pincode: '60601',
        coordinates: { lat: 41.8858, lng: -87.6247 },
      },
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
      tier: 'LEVEL_1_TRAUMA',
      phone: '+1-555-0200',
      emergencyContact: '+1-555-0299',
      isVerified: true,
      address: {
        street: '1000 Madison Ave',
        city: 'New York',
        state: 'NY',
        pincode: '10075',
      },
    },
    {
      userId: users[2]._id,
      name: 'St. Jude Telemetry Care',
      licenseId: 'HOSP-LIC-2026-4422',
      city: 'Chicago',
      networkNode: 'NODE-CHI-EAST-04',
      tier: 'GENERAL_HOSPITAL',
      phone: '+1-555-0300',
      emergencyContact: '+1-555-0399',
      isVerified: true,
      address: {
        street: '330 N Wabash Ave',
        city: 'Chicago',
        state: 'IL',
        pincode: '60611',
      },
    },
  ]);

  console.log('[Seed] Inserting Donors...');
  const donors = await Donor.create([
    {
      userId: users[3]._id,
      donorId: '#LV-DONOR-1041',
      name: 'John Doe',
      phone: '+1-555-0401',
      email: 'john.doe@example.com',
      bloodGroup: 'O-',
      city: 'New York',
      age: 29,
      gender: 'MALE',
      weightKg: 78,
      hemoglobin: 14.2,
      isEligible: true,
      eligibilityStatus: 'ELIGIBLE',
      totalDonationsCount: 5,
      lastDonationDate: new Date('2026-05-10'),
      digitalBadge: 'SILVER_LIFESAVER',
    },
    {
      userId: users[4]._id,
      donorId: '#LV-DONOR-1042',
      name: 'Sarah Connor',
      phone: '+1-555-0402',
      email: 'sarah.c@example.com',
      bloodGroup: 'O+',
      city: 'Chicago',
      age: 34,
      gender: 'FEMALE',
      weightKg: 62,
      hemoglobin: 13.5,
      isEligible: true,
      eligibilityStatus: 'ELIGIBLE',
      totalDonationsCount: 12,
      lastDonationDate: new Date('2026-06-15'),
      digitalBadge: 'GOLD_GUARDIAN',
    },
    {
      userId: users[5]._id,
      donorId: '#LV-DONOR-1043',
      name: 'Michael Scott',
      phone: '+1-555-0403',
      email: 'm.scott@example.com',
      bloodGroup: 'A+',
      city: 'Scranton',
      age: 42,
      gender: 'MALE',
      weightKg: 75,
      hemoglobin: 13.0,
      isEligible: false,
      eligibilityStatus: 'TEMPORARY_DEFERRAL',
      deferralReason: 'Recent travel vaccination',
      deferralUntil: new Date('2026-09-01'),
      totalDonationsCount: 2,
      lastDonationDate: new Date('2026-07-20'),
      digitalBadge: 'BRONZE_HERO',
    },
  ]);

  console.log('[Seed] Inserting Patients...');
  const patients = await Patient.create([
    {
      userId: users[6]._id,
      name: 'Emily Davis',
      phone: '+1-555-0501',
      email: 'emily.davis@example.com',
      bloodGroup: 'B-',
      age: 26,
      gender: 'FEMALE',
      medicalRecordNumber: 'MRN-NY-88301',
      hospitalName: 'Apex City Medical Center',
      attendingPhysician: 'Dr. Gregory House',
      guardianName: 'Robert Davis',
      guardianPhone: '+1-555-0502',
      guardianRelation: 'Father',
    },
  ]);

  console.log('[Seed] Inserting Donation Drives...');
  const drives = await DonationDrive.create([
    {
      driveCode: 'DRIVE-NYC-SUMMER-26',
      title: 'NYC Summer Lifesaver Blood Drive',
      organizer: 'New York City Blood Alliance',
      bloodBankId: bloodBanks[0]._id,
      venue: 'Times Square Medical Pavilion',
      city: 'New York',
      startDate: new Date('2026-08-25'),
      endDate: new Date('2026-08-28'),
      targetUnits: 250,
      collectedUnits: 45,
      status: 'UPCOMING',
    },
  ]);

  console.log('[Seed] Inserting Appointments...');
  await Appointment.create([
    {
      appointmentId: 'LV-APT-2026-8801',
      donor: donors[0]._id,
      bloodBank: bloodBanks[0]._id,
      scheduledDate: new Date('2026-08-22'),
      timeSlot: '10:00 - 11:00',
      location: 'Metropolitan Red Life Vault - Room 2B',
      status: 'SCHEDULED',
      notes: 'Whole blood donation - Routine',
    },
  ]);

  console.log('[Seed] Inserting Inventory Items...');
  const now = new Date();
  const inventoryItems = await InventoryItem.create([
    {
      unitBarcode: 'LV-UNIT-2026-001',
      bloodBankId: bloodBanks[0]._id,
      donorId: donors[0]._id,
      bloodGroup: 'O-',
      component: 'WHOLE_BLOOD',
      volumeMl: 450,
      collectionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-ALPHA-01',
      storageTemperature: 4.2,
      temperatureStatus: 'OPTIMAL',
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-002',
      bloodBankId: bloodBanks[0]._id,
      donorId: donors[0]._id,
      bloodGroup: 'O-',
      component: 'PRBC',
      volumeMl: 300,
      collectionDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-ALPHA-02',
      storageTemperature: 3.9,
      temperatureStatus: 'OPTIMAL',
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-003',
      bloodBankId: bloodBanks[1]._id,
      donorId: donors[1]._id,
      bloodGroup: 'O+',
      component: 'WHOLE_BLOOD',
      volumeMl: 500,
      collectionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 33 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-BETA-01',
      storageTemperature: 4.0,
      temperatureStatus: 'OPTIMAL',
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-004',
      bloodBankId: bloodBanks[0]._id,
      donorId: donors[2]._id,
      bloodGroup: 'A+',
      component: 'PLATELETS',
      volumeMl: 250,
      collectionDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-CRYO-03',
      storageTemperature: 22.0,
      temperatureStatus: 'OPTIMAL',
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-005',
      bloodBankId: bloodBanks[0]._id,
      donorId: donors[0]._id,
      bloodGroup: 'B-',
      component: 'FFP',
      volumeMl: 200,
      collectionDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 350 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-FREEZER-01',
      storageTemperature: -18.5,
      temperatureStatus: 'OPTIMAL',
      status: 'AVAILABLE',
    },
    {
      unitBarcode: 'LV-UNIT-2026-006',
      bloodBankId: bloodBanks[1]._id,
      donorId: donors[1]._id,
      bloodGroup: 'AB+',
      component: 'WHOLE_BLOOD',
      volumeMl: 450,
      collectionDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
      storageLockerId: 'LOCKER-BETA-02',
      storageTemperature: 4.1,
      temperatureStatus: 'OPTIMAL',
      status: 'RESERVED',
    },
  ]);

  console.log('[Seed] Inserting Lab Screenings...');
  await LabScreening.create([
    {
      screeningId: 'LAB-2026-5501',
      unitId: inventoryItems[0]._id,
      donorId: donors[0]._id,
      bloodGroupVerified: 'O-',
      infectiousDiseases: {
        hiv: 'NEGATIVE',
        hepatitisB: 'NEGATIVE',
        hepatitisC: 'NEGATIVE',
        syphilis: 'NEGATIVE',
        malaria: 'NEGATIVE',
      },
      crossMatchStatus: 'COMPATIBLE',
      hemoglobinLevel: 14.2,
      technicianSignature: 'Signed by Chief Lab Tech #LT-881',
      overallResult: 'PASSED',
    },
  ]);

  console.log('[Seed] Inserting Requisitions...');
  await Requisition.create([
    {
      requisitionNumber: 'REQ-2026-9041',
      hospital: hospitals[0]._id,
      hospitalName: 'Apex City Medical Center',
      patient: patients[0]._id,
      patientName: 'Emily Davis',
      bloodGroup: 'O-',
      unitsRequested: 4,
      urgencyLevel: 'CRITICAL',
      status: 'PENDING',
      requestedAt: new Date(),
    },
    {
      requisitionNumber: 'REQ-2026-9042',
      hospital: hospitals[1]._id,
      hospitalName: 'St. Jude Telemetry Care',
      bloodGroup: 'A+',
      unitsRequested: 2,
      urgencyLevel: 'NORMAL',
      status: 'APPROVED',
      requestedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('✅ Seed completed successfully! All 10 collections populated.');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
