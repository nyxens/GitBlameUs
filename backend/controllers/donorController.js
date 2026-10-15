import { Donor, BloodBag, User, Staff, Inventory } from '../models/index.js';
import GiverRequest from '../models/GiverRequest.js';

export async function scheduleDonation(req, res) {
  try {
    const { u_id, weight_donated, S_Id, pincode, bloodgroup, haemoglobin, pressure } = req.body;

    // Find or create default user if not provided
    let userId = u_id;
    if (!userId) {
      const defaultUser = await User.findOne({});
      userId = defaultUser ? defaultUser._id : null;
    }

    // Find default staff if not provided
    let staffId = S_Id;
    if (!staffId) {
      const defaultStaff = await Staff.findOne({});
      staffId = defaultStaff ? defaultStaff._id : null;
    }

    let bloodBag = null;
    if (bloodgroup && staffId) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 35); // 35 days expiry for whole blood

      let inventoryId = req.body.I_ID;
      if (!inventoryId) {
        const defaultInv = await Inventory.findOne({});
        inventoryId = defaultInv ? defaultInv._id : null;
      }

      bloodBag = await BloodBag.create({
        bloodgroup: bloodgroup || 'O+',
        haemoglobin: haemoglobin || 13.5,
        pressure: pressure || '120/80 mmHg',
        date_of_donation: new Date(),
        expired_date: expiry,
        S_Id: staffId,
        I_ID: inventoryId,
        status: 'AVAILABLE',
        weight: weight_donated || 450,
      });
    }

    const donor = await Donor.create({
      u_id: userId,
      date_of_donation: req.body.date_of_donation || new Date(),
      weight_donated: weight_donated || 450,
      bag_id: bloodBag ? bloodBag._id : null,
      S_Id: staffId,
      pincode: pincode || '10001',
    });

    return res.status(201).json({
      success: true,
      donor,
      bloodBag,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

/** Inventory ids of the requester's organization (null = master admin, no restriction). */
async function orgInventoryIds(scope) {
  if (scope.all) return null;
  const invs = await Inventory.find({ hos_or_bank_id: scope.id, hos_or_bank_type: scope.type }).select('_id').lean();
  return invs.map((i) => i._id);
}

/**
 * QUERY: People who have legitimately donated to the requester's organization (a Donor log whose
 * blood bag sits in the organization's inventory). The master admin sees donors of every organization.
 * GET /api/v1/donors
 */
export async function getDonors(req, res) {
  try {
    const inventoryIds = await orgInventoryIds(req.scope);
    const orgBagIds = inventoryIds
      ? (await BloodBag.find({ I_ID: { $in: inventoryIds } }).select('_id').lean()).map((b) => b._id)
      : null;

    const donationFilter = orgBagIds ? { bag_id: { $in: orgBagIds } } : { bag_id: { $ne: null } };
    const donations = await Donor.find(donationFilter).populate('bag_id').lean();
    const donorIds = [...new Set(donations.map((d) => String(d.u_id)))];
    const donorUsers = await User.find({ _id: { $in: donorIds } }).lean();

    const donationsByUser = {};
    for (const d of donations) {
      const uid = String(d.u_id);
      (donationsByUser[uid] = donationsByUser[uid] || []).push(d);
    }

    const pinToCity = {
      '10001': 'New York, NY',
      '10002': 'Manhattan, NY',
      '10003': 'Brooklyn, NY',
      '10014': 'Queens, NY',
      '10016': 'Jersey City, NJ',
      '10022': 'Bronx, NY',
      '10029': 'Staten Island, NY',
      '10032': 'Long Island, NY',
    };

    const donorsList = donorUsers
      .filter((u) => u.name || u.username)
      .map((u, index) => {
        const uId = u._id.toString();
        const userDons = donationsByUser[uId] || [];
        userDons.sort((a, b) => new Date(b.date_of_donation) - new Date(a.date_of_donation));

        const totalDonations = userDons.length;
        const lastDonRecord = userDons[0];
        const lastDonDate = lastDonRecord ? new Date(lastDonRecord.date_of_donation) : null;

        let eligibility = 'ELIGIBLE';
        if (lastDonDate) {
          const diffDays = Math.floor((Date.now() - lastDonDate.getTime()) / (1000 * 60 * 60 * 24));
          const cooldown = 56;
          if (diffDays >= 0 && diffDays < cooldown) {
            eligibility = `INELIGIBLE (Wait ${cooldown - diffDays} Days)`;
          }
        }

        const formattedLastDonation = lastDonDate
          ? lastDonDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : 'First Time';

        const bloodGroup = u.bloodgroup || (lastDonRecord?.bag_id?.bloodgroup) || 'O+';
        const city = pinToCity[u.pincode] || (u.pincode ? `Metro Zone ${u.pincode}` : 'New York, NY');

        return {
          id: `DNR-${u._id.toString().slice(-4).toUpperCase()}`,
          dbId: uId,
          name: u.name || u.username,
          bloodGroup,
          totalDonations,
          lastDonation: formattedLastDonation,
          eligibility,
          phone: u.phone || '—',
          city,
          pincode: u.pincode || '—',
        };
      });

    const eligibleNow = donorsList.filter((d) => d.eligibility.startsWith('ELIGIBLE')).length;
    const totalDonatedUnits = donations.length;
    const incomingRequestsCount = await GiverRequest.countDocuments({
      status: { $in: ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'ACCEPTED'] },
      ...(req.scope.all ? {} : { [req.scope.type === 'Hospital' ? 'hospital_id' : 'bloodbank_id']: req.scope.id }),
    });

    return res.status(200).json({
      success: true,
      count: donorsList.length,
      metrics: {
        registeredDonors: donorsList.length,
        eligibleNow,
        totalDonatedUnits,
        incomingRequests: incomingRequestsCount,
      },
      donors: donorsList,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class DonorController {
  static scheduleDonation = scheduleDonation;
  static getDonors = getDonors;
}
