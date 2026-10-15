import crypto from 'crypto';
import { connectDB } from './config/db.js';
import { Inventory, BloodBag, Staff } from './models/index.js';

/**
 * Fills every inventory that has no blood bags with random units spread over the last 30 days
 * (some already used / discarded) so stock levels look realistic.
 * Inventories that already hold bags are skipped, so it is safe to re-run.
 */
const GROUPS = ['O+', 'O+', 'O+', 'A+', 'A+', 'B+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
const DAY = 24 * 60 * 60 * 1000;
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  if (!(await connectDB())) process.exit(1);
  const now = Date.now();
  let inventories = 0;
  let created = 0;

  for (const inv of await Inventory.find()) {
    if (await BloodBag.exists({ I_ID: inv._id })) continue;
    const staff = await Staff.find({ hos_or_bank_id: inv.hos_or_bank_id }).select('_id').lean();
    const total = Math.min(rand(15, 40), inv.capacity || 100);
    const docs = [];
    let available = 0;

    for (let i = 0; i < total; i += 1) {
      const donated = now - rand(0, 29) * DAY - rand(0, 20) * 60 * 60 * 1000;
      const roll = Math.random();
      const status = roll < 0.65 ? 'AVAILABLE' : roll < 0.88 ? 'TRANSFUSED' : 'DISCARDED';
      const expires = donated + 35 * DAY;
      // Used / discarded some time after donation (never in the future)
      const touched = Math.min(now, donated + rand(1, 12) * DAY);
      const bag = new BloodBag({
        bloodgroup: pick(GROUPS),
        weight: pick([350, 450, 450, 450]),
        haemoglobin: Number((12.5 + Math.random() * 3).toFixed(1)),
        pressure: `${rand(110, 130)}/${rand(70, 85)} mmHg`,
        date_of_donation: new Date(donated),
        expired_date: new Date(expires),
        S_Id: staff.length ? pick(staff)._id : null,
        I_ID: inv._id,
        status,
        isdiscresed: status !== 'AVAILABLE',
        barcode: `LV-${crypto.randomBytes(5).toString('hex').toUpperCase()}`,
      });
      const doc = bag.toObject({ virtuals: false });
      doc.createdAt = new Date(donated);
      doc.updatedAt = new Date(status === 'AVAILABLE' ? donated : touched);
      docs.push(doc);
      if (status === 'AVAILABLE') available += 1;
    }

    // Raw insert so the backdated createdAt / updatedAt are kept
    await BloodBag.collection.insertMany(docs);
    await Inventory.updateOne({ _id: inv._id }, { current_count: available, isfull: available >= (inv.capacity || 100) });
    inventories += 1;
    created += docs.length;
  }
  console.log(`Inventories filled: ${inventories} | blood bags created: ${created}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
