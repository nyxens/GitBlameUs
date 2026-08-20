import { Donor, BloodBag, User, Staff } from '../models/index.js';

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
    const donors = await Donor.find({})
      .populate('u_id', 'username email bloodgroup DOB pincode')
      .populate('S_Id', 'role department licence_id')
      .populate('bag_id');
    return res.status(200).json({ success: true, count: donors.length, donors });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class DonorController {
  static scheduleDonation = scheduleDonation;
  static getDonors = getDonors;
}
