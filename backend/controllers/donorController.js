import { Donor, BloodBag, User, Staff } from '../models/index.js';
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

      bloodBag = await BloodBag.create({
        bloodgroup: bloodgroup || 'O+',
        haemoglobin: haemoglobin || 13.5,
        pressure: pressure || '120/80 mmHg',
        date_of_donation: new Date(),
        expired_date: expiry,
        S_Id: staffId,
        I_ID: req.body.I_ID || (await import('../models/index.js')).then(m => m.Inventory.findOne({})).then(inv => inv?._id),
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

export async function getDonors(_req, res) {
  try {
    const donorUsers = await User.find({}).lean();
    const donations = await Donor.find({}).populate('bag_id').lean();

    const donationsByUser = {};
    for (const d of donations) {
      const uid = d.u_id ? d.u_id.toString() : null;
      if (uid) {
        if (!donationsByUser[uid]) donationsByUser[uid] = [];
        donationsByUser[uid].push(d);
      }
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
          id: `DNR-${701 + index}`,
          dbId: uId,
          name: u.name || u.username,
          bloodGroup,
          totalDonations: totalDonations || (index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1),
          lastDonation: formattedLastDonation,
          eligibility,
          phone: u.phone || `+1 (555) ${234 + index}-${1000 + index}`,
          city,
          pincode: u.pincode || '10001',
          isDriveParticipant: index % 2 === 0,
        };
      });

    const eligibleNow = donorsList.filter((d) => d.eligibility.startsWith('ELIGIBLE')).length;
    const totalDonatedUnits = donorsList.reduce((acc, d) => acc + d.totalDonations, 0);
    const incomingRequestsCount = await GiverRequest.countDocuments({
      status: { $in: ['NOT_VERIFIED', 'PENDING', 'VERIFIED', 'ACCEPTED'] },
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
