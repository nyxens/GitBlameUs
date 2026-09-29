import bcrypt from 'bcrypt';
import { connectDB } from './config/db.js';
import {
  Admin,
  Hospital,
  BloodBank,
  Staff,
  User,
  Donor,
  Inventory,
  BloodBag,
  Request as BloodRequest,
  Allotment,
} from './models/index.js';

const SALT_ROUNDS = 12;

async function seedDatabase() {
  console.log('\n======================================================');
  console.log('🩸 [LifeVault BBMS] Seeding 10-Collection Database...');
  console.log('======================================================\n');

  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Could not connect to MongoDB. Check MONGO_URI in .env');
    process.exit(1);
  }

  console.log('[1/8] Clearing existing collections...');
  await Promise.all([
    Admin.deleteMany({}),
    Hospital.deleteMany({}),
    BloodBank.deleteMany({}),
    Staff.deleteMany({}),
    User.deleteMany({}),
    Donor.deleteMany({}),
    Inventory.deleteMany({}),
    BloodBag.deleteMany({}),
    BloodRequest.deleteMany({}),
    Allotment.deleteMany({}),
  ]);
  console.log('   ✓ Cleared all 10 collections successfully.');

  // --- 1. SEED ADMINS ---
  console.log('\n[2/8] Creating Admin accounts...');
  const masterAdminPassword = await bcrypt.hash('LifeVaultAdmin2026!', SALT_ROUNDS);
  const facilityAdminPassword = await bcrypt.hash('AdminPass2026!', SALT_ROUNDS);

  const [masterAdmin, regionalAdmin] = await Admin.create([
    {
      username: 'masteradmin',
      email: 'admin@lifevault.org',
      password: masterAdminPassword,
    },
    {
      username: 'facilityadmin',
      email: 'facility.admin@metrohealth.org',
      password: facilityAdminPassword,
    },
  ]);
  console.log('   ✓ Created 2 Admins:');
  console.log('     • admin@lifevault.org (Password: LifeVaultAdmin2026!)');
  console.log('     • facility.admin@metrohealth.org (Password: AdminPass2026!)');

  // --- 2. SEED USERS ---
  console.log('\n[3/8] Creating Base Users (Donors, Patients, Medical Staff)...');
  const userPassword = await bcrypt.hash('UserPass2026!', SALT_ROUNDS);

  const rawUsers = [
    // Staff user accounts
    { username: 'dr.sarah.connor', email: 'sarah.connor@metrohealth.org', DOB: '1985-04-12', pincode: '10001', bloodgroup: 'O+', gender: 'FEMALE', name: 'Dr. Sarah Connor', phone: '+1-555-0101' },
    { username: 'tech.david.miller', email: 'david.miller@metroblood.org', DOB: '1990-08-23', pincode: '10002', bloodgroup: 'A+', gender: 'MALE', name: 'David Miller', phone: '+1-555-0102' },
    { username: 'nurse.elena.rostova', email: 'elena.rostova@stjude.org', DOB: '1993-11-15', pincode: '10003', bloodgroup: 'B+', gender: 'FEMALE', name: 'Elena Rostova', phone: '+1-555-0103' },
    { username: 'mgr.marcus.vance', email: 'marcus.vance@redcross.org', DOB: '1982-01-30', pincode: '10001', bloodgroup: 'AB+', gender: 'MALE', name: 'Marcus Vance', phone: '+1-555-0104' },
    // Donor / Citizen user accounts
    { username: 'alex.rivers', email: 'alex.rivers@gmail.com', DOB: '1998-05-14', pincode: '10001', bloodgroup: 'O-', gender: 'MALE', name: 'Alex Rivers', phone: '+1-555-0201' },
    { username: 'maya.lin', email: 'maya.lin@yahoo.com', DOB: '1995-09-20', pincode: '10002', bloodgroup: 'O+', gender: 'FEMALE', name: 'Maya Lin', phone: '+1-555-0202' },
    { username: 'jordan.bell', email: 'jordan.bell@outlook.com', DOB: '1992-03-08', pincode: '10001', bloodgroup: 'A-', gender: 'OTHER', name: 'Jordan Bell', phone: '+1-555-0203' },
    { username: 'liam.chen', email: 'liam.chen@gmail.com', DOB: '1988-12-01', pincode: '10003', bloodgroup: 'A+', gender: 'MALE', name: 'Liam Chen', phone: '+1-555-0204' },
    { username: 'sophia.martinez', email: 'sophia.m@gmail.com', DOB: '1999-07-19', pincode: '10002', bloodgroup: 'B-', gender: 'FEMALE', name: 'Sophia Martinez', phone: '+1-555-0205' },
    { username: 'ethan.hunt', email: 'ethan.hunt@imf.org', DOB: '1986-06-25', pincode: '10001', bloodgroup: 'B+', gender: 'MALE', name: 'Ethan Hunt', phone: '+1-555-0206' },
    { username: 'clara.oswald', email: 'clara.oswald@bbc.co.uk', DOB: '1994-10-10', pincode: '10003', bloodgroup: 'AB-', gender: 'FEMALE', name: 'Clara Oswald', phone: '+1-555-0207' },
    { username: 'bruce.wayne', email: 'bruce.wayne@waynecorp.com', DOB: '1984-02-19', pincode: '10001', bloodgroup: 'AB+', gender: 'MALE', name: 'Bruce Wayne', phone: '+1-555-0208' },
    // Patient recipients placing requests
    { username: 'patient.john.doe', email: 'john.doe@patient.org', DOB: '1975-04-18', pincode: '10001', bloodgroup: 'O-', gender: 'MALE', name: 'John Doe', phone: '+1-555-0301' },
    { username: 'patient.alice.smith', email: 'alice.smith@patient.org', DOB: '1989-11-22', pincode: '10002', bloodgroup: 'A+', gender: 'FEMALE', name: 'Alice Smith', phone: '+1-555-0302' },
  ];

  const createdUsers = await User.create(
    rawUsers.map((u) => ({
      ...u,
      password: userPassword,
      status: 'ACTIVE',
    }))
  );
  console.log(`   ✓ Created ${createdUsers.length} Users (Default password: UserPass2026!).`);

  // --- 3. SEED HOSPITALS & BLOOD BANKS ---
  console.log('\n[4/8] Creating Hospitals and BloodBanks...');
  const [metroHospital, stJudeHospital] = await Hospital.create([
    {
      hos_name: 'Metro Health Memorial Hospital',
      pincode: '10001',
      admin_id: masterAdmin._id,
      phone: '+1-212-555-4001',
      email: 'contact@metrohealth.org',
      address: '450 First Ave, New York, NY 10001',
      latitude: 40.7396,
      longitude: -73.975,
    },
    {
      hos_name: 'St. Jude General Trauma Center',
      pincode: '10003',
      admin_id: regionalAdmin._id,
      phone: '+1-212-555-4002',
      email: 'emergency@stjude.org',
      address: '128 E 17th St, New York, NY 10003',
      latitude: 40.7351,
      longitude: -73.988,
    },
  ]);

  const [metroBloodBank, centralRedCross] = await BloodBank.create([
    {
      bank_name: 'Metro Regional Blood Center',
      pincode: '10001',
      admin_id: masterAdmin._id,
      contact_no: '+1-212-555-5001',
      email: 'dispatch@metroblood.org',
      address: '720 2nd Ave, New York, NY 10001',
      latitude: 40.7473,
      longitude: -73.9709,
    },
    {
      bank_name: 'Central Red Cross Blood Bank',
      pincode: '10002',
      admin_id: regionalAdmin._id,
      contact_no: '+1-212-555-5002',
      email: 'operations@redcross.org',
      address: '520 W 49th St, New York, NY 10002',
      latitude: 40.7628,
      longitude: -73.993,
    },
  ]);
  console.log('   ✓ Created 2 Hospitals and 2 BloodBanks.');

  // --- 4. SEED INVENTORY (Cold-Storage Lockers) ---
  console.log('\n[5/8] Setting up Inventory Cold Storage Lockers...');
  const inventories = await Inventory.create([
    {
      cellno: 'CELL-RBC-A1',
      shelfno: 'SHELF-01',
      pincode: '10001',
      hos_or_bank_id: metroBloodBank._id,
      hos_or_bank_type: 'BloodBank',
      isfull: false,
      capacity: 100,
      current_count: 14,
    },
    {
      cellno: 'CELL-RBC-A2',
      shelfno: 'SHELF-02',
      pincode: '10001',
      hos_or_bank_id: metroBloodBank._id,
      hos_or_bank_type: 'BloodBank',
      isfull: false,
      capacity: 100,
      current_count: 8,
    },
    {
      cellno: 'CELL-TRAUMA-01',
      shelfno: 'SHELF-EMERGENCY',
      pincode: '10001',
      hos_or_bank_id: metroHospital._id,
      hos_or_bank_type: 'Hospital',
      isfull: false,
      capacity: 50,
      current_count: 6,
    },
    {
      cellno: 'CELL-CRYOBANK-B1',
      shelfno: 'SHELF-03',
      pincode: '10002',
      hos_or_bank_id: centralRedCross._id,
      hos_or_bank_type: 'BloodBank',
      isfull: false,
      capacity: 120,
      current_count: 10,
    },
  ]);

  // Link primary inventory back to facilities
  metroBloodBank.I_Id = inventories[0]._id;
  await metroBloodBank.save();
  metroHospital.I_Id = inventories[2]._id;
  await metroHospital.save();
  centralRedCross.I_Id = inventories[3]._id;
  await centralRedCross.save();
  console.log(`   ✓ Configured ${inventories.length} physical Inventory lockers with cell/shelf units.`);

  // --- 5. SEED STAFF ---
  console.log('\n[6/8] Registering Medical Staff...');
  const staffMembers = await Staff.create([
    {
      u_id: createdUsers[0]._id, // Dr. Sarah Connor
      role: 'DOCTOR',
      department: 'Trauma & Transfusion Medicine',
      licence_id: 'MD-NY-2015-8842',
      hos_or_bank_id: metroHospital._id,
      hos_or_bank_type: 'Hospital',
      admin_id: masterAdmin._id,
    },
    {
      u_id: createdUsers[1]._id, // David Miller
      role: 'LAB_TECHNICIAN',
      department: 'Hematology & Safety Screening',
      licence_id: 'TECH-NY-2018-4019',
      hos_or_bank_id: metroBloodBank._id,
      hos_or_bank_type: 'BloodBank',
      admin_id: masterAdmin._id,
    },
    {
      u_id: createdUsers[2]._id, // Elena Rostova
      role: 'PHLEBOTOMIST',
      department: 'Blood Collection & Mobile Drives',
      licence_id: 'PHLEB-NY-2020-6102',
      hos_or_bank_id: stJudeHospital._id,
      hos_or_bank_type: 'Hospital',
      admin_id: regionalAdmin._id,
    },
    {
      u_id: createdUsers[3]._id, // Marcus Vance
      role: 'MANAGER',
      department: 'Regional Dispatch Operations',
      licence_id: 'MGR-NY-2012-1008',
      hos_or_bank_id: centralRedCross._id,
      hos_or_bank_type: 'BloodBank',
      admin_id: masterAdmin._id,
    },
  ]);
  console.log(`   ✓ Registered ${staffMembers.length} Staff members (Doctor, Lab Tech, Phlebotomist, Manager).`);

  // --- 6. SEED BLOODBAGS & DONORS ---
  console.log('\n[7/8] Producing BloodBags and recording Donor donation events...');
  const bloodBagSpecs = [
    { bg: 'O-', hgb: 14.8, bp: '118/75 mmHg', weight: 450, invIdx: 0, staffIdx: 1, donorUserIdx: 4, daysExpiry: 12 },
    { bg: 'O-', hgb: 15.2, bp: '122/80 mmHg', weight: 450, invIdx: 0, staffIdx: 1, donorUserIdx: 4, daysExpiry: 28 },
    { bg: 'O+', hgb: 14.1, bp: '120/80 mmHg', weight: 450, invIdx: 0, staffIdx: 1, donorUserIdx: 5, daysExpiry: 8 },
    { bg: 'O+', hgb: 13.9, bp: '115/78 mmHg', weight: 450, invIdx: 0, staffIdx: 2, donorUserIdx: 5, daysExpiry: 34 },
    { bg: 'A-', hgb: 14.6, bp: '125/82 mmHg', weight: 450, invIdx: 1, staffIdx: 1, donorUserIdx: 6, daysExpiry: 15 },
    { bg: 'A+', hgb: 15.0, bp: '120/78 mmHg', weight: 450, invIdx: 1, staffIdx: 1, donorUserIdx: 7, daysExpiry: 22 },
    { bg: 'A+', hgb: 14.4, bp: '118/76 mmHg', weight: 450, invIdx: 2, staffIdx: 0, donorUserIdx: 7, daysExpiry: 5 },
    { bg: 'B-', hgb: 13.8, bp: '110/70 mmHg', weight: 450, invIdx: 3, staffIdx: 3, donorUserIdx: 8, daysExpiry: 18 },
    { bg: 'B+', hgb: 15.5, bp: '124/80 mmHg', weight: 450, invIdx: 3, staffIdx: 3, donorUserIdx: 9, daysExpiry: 30 },
    { bg: 'AB-', hgb: 14.0, bp: '116/74 mmHg', weight: 450, invIdx: 1, staffIdx: 1, donorUserIdx: 10, daysExpiry: 25 },
    { bg: 'AB+', hgb: 16.1, bp: '128/84 mmHg', weight: 450, invIdx: 0, staffIdx: 1, donorUserIdx: 11, daysExpiry: 35 },
    // Reserved / Allocated bag spec
    { bg: 'O-', hgb: 14.5, bp: '120/80 mmHg', weight: 450, invIdx: 2, staffIdx: 0, donorUserIdx: 4, daysExpiry: 20, status: 'ALLOCATED' },
  ];

  const createdBags = [];
  const createdDonors = [];

  for (const spec of bloodBagSpecs) {
    const donationDate = new Date();
    donationDate.setDate(donationDate.getDate() - (42 - spec.daysExpiry));

    const expiryDate = new Date(donationDate);
    expiryDate.setDate(expiryDate.getDate() + 42); // 42-day lifespan

    const bag = await BloodBag.create({
      bloodgroup: spec.bg,
      haemoglobin: spec.hgb,
      pressure: spec.bp,
      date_of_donation: donationDate,
      isdiscresed: false,
      expired_date: expiryDate,
      S_Id: staffMembers[spec.staffIdx]._id,
      I_ID: inventories[spec.invIdx]._id,
      status: spec.status || 'AVAILABLE',
      weight: spec.weight,
      maxcost: 50.0,
    });
    createdBags.push(bag);

    const donor = await Donor.create({
      u_id: createdUsers[spec.donorUserIdx]._id,
      date_of_donation: donationDate,
      weight_donated: spec.weight,
      bag_id: bag._id,
      S_Id: staffMembers[spec.staffIdx]._id,
      pincode: createdUsers[spec.donorUserIdx].pincode,
    });
    createdDonors.push(donor);
  }
  console.log(`   ✓ Created ${createdBags.length} BloodBags across all 8 ABO/Rh blood groups.`);
  console.log(`   ✓ Created ${createdDonors.length} Donor donation records linked to collecting Staff.`);

  // --- 7. SEED REQUESTS & ALLOTMENTS ---
  console.log('\n[8/8] Processing Patient Requests and Allotment dispatches...');
  const patientJohn = createdUsers[12]; // John Doe (O-)
  const patientAlice = createdUsers[13]; // Alice Smith (A+)

  // Request 1: Fulfilled O- request with Allotment
  const reqFulfilled = await BloodRequest.create({
    u_id: patientJohn._id,
    bloodgroup: 'O-',
    weight: 450,
    pincode: '10001',
    date_of_request: new Date(Date.now() - 3600000 * 4), // 4 hrs ago
    date_of_requirement: new Date(Date.now() + 3600000 * 2), // 2 hrs from now
    status: 'FULFILLED',
  });

  const allocatedBag = createdBags[11]; // The allocated O- bag
  const allotment = await Allotment.create({
    req_id: reqFulfilled._id,
    bag_id: allocatedBag._id,
    s_id: staffMembers[0]._id, // Dr. Sarah Connor
    date_of_allocation: new Date(Date.now() - 3600000 * 2),
  });

  reqFulfilled.A_id = allotment._id;
  await reqFulfilled.save();

  // Request 2: Urgent Pending A+ request
  const reqPending = await BloodRequest.create({
    u_id: patientAlice._id,
    bloodgroup: 'A+',
    weight: 450,
    pincode: '10002',
    date_of_request: new Date(),
    date_of_requirement: new Date(Date.now() + 86400000), // 24 hrs
    status: 'PENDING',
  });

  // Request 3: Pending Emergency O- request
  const reqEmergency = await BloodRequest.create({
    u_id: patientJohn._id,
    bloodgroup: 'O-',
    weight: 900,
    pincode: '10001',
    date_of_request: new Date(),
    date_of_requirement: new Date(Date.now() + 3600000 * 6), // 6 hrs
    status: 'PENDING',
  });

  console.log('   ✓ Created 3 Requests (1 FULFILLED with Allotment, 2 PENDING).');
  console.log('   ✓ Created 1 Allotment linking Request to BloodBag authorized by Staff.');

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('\n🔑 Test Login Credentials:');
  console.log('┌──────────────────────┬────────────────────────────────┬──────────────────────┐');
  console.log('│ Role                 │ Email                          │ Password             │');
  console.log('├──────────────────────┼────────────────────────────────┼──────────────────────┤');
  console.log('│ Master Super Admin   │ admin@lifevault.org            │ LifeVaultAdmin2026!  │');
  console.log('│ Facility Admin       │ facility.admin@metrohealth.org │ AdminPass2026!       │');
  console.log('│ Staff (Doctor)       │ sarah.connor@metrohealth.org   │ UserPass2026!        │');
  console.log('│ Staff (Lab Tech)     │ david.miller@metroblood.org    │ UserPass2026!        │');
  console.log('│ Donor (Alex Rivers)  │ alex.rivers@gmail.com          │ UserPass2026!        │');
  console.log('│ Patient (John Doe)   │ john.doe@patient.org           │ UserPass2026!        │');
  console.log('└──────────────────────┴────────────────────────────────┴──────────────────────┘\n');

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('❌ Fatal error during database seeding:', err);
  process.exit(1);
});
