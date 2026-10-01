import fs from 'fs';
import { connectDB } from './config/db.js';
import { Admin, Hospital, BloodBank, Inventory } from './models/index.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const slug = (name) => name.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 24);

/** data.json is JS-flavoured (// comments, `new Date()`), so clean it before parsing. */
function readRecords() {
  const text = fs.readFileSync(new URL('./models/data.json', import.meta.url), 'utf8')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/new Date\(\)/g, 'null');
  return (text.match(/^\[[\s\S]*?^\]/gm) || []).flatMap((block) => JSON.parse(block));
}

const FACILITY_TYPES = [
  { Model: Hospital, type: 'Hospital', nameKey: 'hos_name', phoneKey: 'phone', label: 'hospitals' },
  { Model: BloodBank, type: 'BloodBank', nameKey: 'bank_name', phoneKey: 'contact_no', label: 'blood banks' },
];

async function loadFacilities() {
  if (!(await connectDB())) {
    console.error('Could not connect to MongoDB. Check MONGO_URI in .env');
    process.exit(1);
  }
  const admin = await Admin.findOne({}).lean();
  const records = readRecords();

  for (const { Model, type, nameKey, phoneKey, label } of FACILITY_TYPES) {
    const items = records.filter((r) => r[nameKey]);
    let created = 0;
    let skipped = 0;

    for (const rec of items) {
      if (await Model.exists({ [nameKey]: rec[nameKey] })) {
        skipped += 1;
        continue;
      }
      const doc = await Model.create({
        [nameKey]: rec[nameKey],
        pincode: rec.pincode || '500001',
        [phoneKey]: rec[phoneKey] || `+91-40-${randInt(2000, 6999)}${randInt(1000, 9999)}`,
        email: rec.email || `info@${slug(rec[nameKey])}.in`,
        address: rec.address || `${randInt(1, 99)}, Main Road, Hyderabad, Telangana`,
        latitude: rec.latitude ?? null,
        longitude: rec.longitude ?? null,
        geocodeAttemptedAt: rec.geocodeAttemptedAt ? new Date(rec.geocodeAttemptedAt) : new Date(),
        admin_id: rec.admin_id || admin?._id || null,
      });
      const inventory = await Inventory.create({
        cellno: `CELL-${randInt(1, 12)}`,
        shelfno: `SHELF-${randInt(1, 8)}`,
        pincode: doc.pincode,
        hos_or_bank_id: doc._id,
        hos_or_bank_type: type,
        capacity: pick([100, 150, 200, 300, 500]),
        current_count: 0,
      });
      doc.I_Id = inventory._id;
      await doc.save();
      created += 1;
    }
    console.log(`${label}: ${items.length} in data.json | created: ${created} | already existed (skipped): ${skipped}`);
  }
  process.exit(0);
}

loadFacilities().catch((err) => {
  console.error(err);
  process.exit(1);
});
