import fs from 'fs';
import { connectDB } from './config/db.js';
import { Admin, Hospital, Inventory } from './models/index.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const slug = (name) => name.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 24);

/** data.json is JS-flavoured (// comments, `new Date()`), so clean it before parsing. Hospital arrays only. */
function readHospitals() {
  const text = fs.readFileSync(new URL('./models/data.json', import.meta.url), 'utf8')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/new Date\(\)/g, 'null');
  return (text.match(/^\[[\s\S]*?^\]/gm) || [])
    .flatMap((block) => JSON.parse(block))
    .filter((item) => item.hos_name);
}

async function loadHospitals() {
  if (!(await connectDB())) {
    console.error('Could not connect to MongoDB. Check MONGO_URI in .env');
    process.exit(1);
  }
  const admin = await Admin.findOne({}).lean();
  const records = readHospitals();
  let created = 0;
  let skipped = 0;

  for (const rec of records) {
    if (await Hospital.exists({ hos_name: rec.hos_name })) {
      skipped += 1;
      continue;
    }
    const hospital = await Hospital.create({
      hos_name: rec.hos_name,
      pincode: rec.pincode || '500001',
      phone: rec.phone || `+91-40-${randInt(2000, 6999)}${randInt(1000, 9999)}`,
      email: rec.email || `info@${slug(rec.hos_name)}.in`,
      address: rec.address || `${randInt(1, 99)}, Main Road, Hyderabad, Telangana`,
      latitude: rec.latitude ?? null,
      longitude: rec.longitude ?? null,
      geocodeAttemptedAt: rec.geocodeAttemptedAt ? new Date(rec.geocodeAttemptedAt) : new Date(),
      admin_id: rec.admin_id || admin?._id || null,
    });
    const capacity = pick([100, 150, 200, 300, 500]);
    const inventory = await Inventory.create({
      cellno: `CELL-${randInt(1, 12)}`,
      shelfno: `SHELF-${randInt(1, 8)}`,
      pincode: hospital.pincode,
      hos_or_bank_id: hospital._id,
      hos_or_bank_type: 'Hospital',
      capacity,
      current_count: 0,
    });
    hospital.I_Id = inventory._id;
    await hospital.save();
    created += 1;
  }
  console.log(`Hospitals in data.json: ${records.length} | created: ${created} | already existed (skipped): ${skipped}`);
  process.exit(0);
}

loadHospitals().catch((err) => {
  console.error(err);
  process.exit(1);
});
