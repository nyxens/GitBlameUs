/**
 * =======================================================================================
 * SEED: Hyderabad, Telangana Hospitals & Blood Banks (dummy data)
 * =======================================================================================
 * Purpose: populate Hospital / BloodBank documents with real-world-shaped
 * pincode + latitude/longitude pairs so the "nearby institutions" feature
 * (both pincode mode and Geolocation/coords mode) has something to search
 * against locally.
 *
 * This script is ADDITIVE — it does NOT clear existing collections like the
 * main seed.js does. It's safe to run alongside your existing seed data.
 * Re-running it is also safe: it upserts by (name + pincode) so you won't
 * get duplicates.
 *
 * Run with: npm run seed:hyderabad
 * =======================================================================================
 */
import { connectDB } from '../config/db.js';
import Hospital from '../models/Hospital.js';
import BloodBank from '../models/BloodBank.js';

const HYDERABAD_HOSPITALS = [
  {
    hos_name: 'Banjara Hills Multispeciality Hospital',
    pincode: '500034',
    latitude: 17.4126,
    longitude: 78.4483,
    phone: '+91-40-2354-1001',
    email: 'contact@banjarahillshospital.in',
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
  },
  {
    hos_name: 'Secunderabad City Hospital',
    pincode: '500003',
    latitude: 17.4399,
    longitude: 78.4983,
    phone: '+91-40-2780-1002',
    email: 'info@secunderabadcityhospital.in',
    address: 'SP Road, Secunderabad, Telangana 500003',
  },
  {
    hos_name: 'Gachibowli Tech Valley Hospital',
    pincode: '500032',
    latitude: 17.4401,
    longitude: 78.3489,
    phone: '+91-40-6712-1003',
    email: 'care@gachibowlihospital.in',
    address: 'Financial District, Gachibowli, Hyderabad, Telangana 500032',
  },
  {
    hos_name: 'Kukatpally Community Hospital',
    pincode: '500072',
    latitude: 17.4849,
    longitude: 78.4138,
    phone: '+91-40-2306-1004',
    email: 'reception@kukatpallyhospital.in',
    address: 'KPHB Colony, Kukatpally, Hyderabad, Telangana 500072',
  },
  {
    hos_name: 'Dilsukhnagar General Hospital',
    pincode: '500060',
    latitude: 17.3687,
    longitude: 78.5247,
    phone: '+91-40-2401-1005',
    email: 'help@dilsukhnagarhospital.in',
    address: 'Chaitanyapuri, Dilsukhnagar, Hyderabad, Telangana 500060',
  },
  {
    hos_name: 'Mehdipatnam Trauma & Emergency Center',
    pincode: '500028',
    latitude: 17.3949,
    longitude: 78.4344,
    phone: '+91-40-2352-1006',
    email: 'emergency@mehdipatnamtrauma.in',
    address: 'Old Mumbai Highway, Mehdipatnam, Hyderabad, Telangana 500028',
  },
];

const HYDERABAD_BLOODBANKS = [
  {
    bank_name: 'Deccan Regional Blood Bank',
    pincode: '500016',
    latitude: 17.4374,
    longitude: 78.4487,
    contact_no: '+91-40-2373-2001',
    email: 'dispatch@deccanbloodbank.in',
    address: 'Ameerpet, Hyderabad, Telangana 500016',
  },
  {
    bank_name: 'Jubilee Hills Voluntary Blood Center',
    pincode: '500033',
    latitude: 17.4239,
    longitude: 78.4136,
    contact_no: '+91-40-2354-2002',
    email: 'ops@jubileehillsblood.in',
    address: 'Road No. 3, Jubilee Hills, Hyderabad, Telangana 500033',
  },
  {
    bank_name: 'Kondapur Life Blood Bank',
    pincode: '500084',
    latitude: 17.4615,
    longitude: 78.3627,
    contact_no: '+91-40-4855-2003',
    email: 'contact@kondapurlifeblood.in',
    address: 'Botanical Garden Road, Kondapur, Hyderabad, Telangana 500084',
  },
  {
    bank_name: 'Uppal Community Blood Bank',
    pincode: '500039',
    latitude: 17.4058,
    longitude: 78.5591,
    contact_no: '+91-40-2712-2004',
    email: 'info@uppalbloodbank.in',
    address: 'Uppal Ring Road, Hyderabad, Telangana 500039',
  },
  {
    bank_name: 'Malakpet Central Blood Bank',
    pincode: '500036',
    latitude: 17.3739,
    longitude: 78.4991,
    contact_no: '+91-40-2465-2005',
    email: 'help@malakpetbloodbank.in',
    address: 'Malakpet, Hyderabad, Telangana 500036',
  },
  {
    bank_name: 'Begumpet Voluntary Donors Blood Bank',
    pincode: '500016',
    latitude: 17.4437,
    longitude: 78.4613,
    contact_no: '+91-40-2790-2006',
    email: 'donate@begumpetbloodbank.in',
    address: 'Begumpet, Hyderabad, Telangana 500016',
  },
];

async function seedHyderabadInstitutions() {
  console.log('\n======================================================');
  console.log('📍 [LifeVault BBMS] Seeding Hyderabad Hospitals & Blood Banks...');
  console.log('======================================================\n');

  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Could not connect to MongoDB. Check MONGO_URI in .env');
    process.exit(1);
  }

  let hospitalsCreated = 0;
  let hospitalsUpdated = 0;
  for (const h of HYDERABAD_HOSPITALS) {
    const result = await Hospital.findOneAndUpdate(
      { hos_name: h.hos_name, pincode: h.pincode },
      { $set: h },
      { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true }
    );
    if (result.lastErrorObject?.upserted) hospitalsCreated++;
    else hospitalsUpdated++;
  }
  console.log(`   ✓ Hospitals: ${hospitalsCreated} created, ${hospitalsUpdated} already existed (updated coords).`);

  let bloodBanksCreated = 0;
  let bloodBanksUpdated = 0;
  for (const bb of HYDERABAD_BLOODBANKS) {
    const result = await BloodBank.findOneAndUpdate(
      { bank_name: bb.bank_name, pincode: bb.pincode },
      { $set: bb },
      { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true }
    );
    if (result.lastErrorObject?.upserted) bloodBanksCreated++;
    else bloodBanksUpdated++;
  }
  console.log(`   ✓ Blood Banks: ${bloodBanksCreated} created, ${bloodBanksUpdated} already existed (updated coords).`);

  console.log('\n======================================================');
  console.log('🎉 HYDERABAD SEEDING COMPLETE!');
  console.log('======================================================');
  console.log(`\nTry searching "nearby" with a Hyderabad pincode (e.g. 500034)`);
  console.log('or coordinates (e.g. lat=17.4126, lng=78.4483 — Banjara Hills).\n');

  process.exit(0);
}

seedHyderabadInstitutions().catch((err) => {
  console.error('❌ Fatal error during Hyderabad seeding:', err);
  process.exit(1);
});
