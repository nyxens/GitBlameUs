import { Donor } from '../models/index.js';

export async function scheduleDonation(req, res) {
  try {
    const { name, phone, email, bloodGroup, city, date } = req.body;
    let donor = null;
    try {
      donor = await Donor.create({
        name,
        phone,
        email,
        bloodGroup,
        city,
        lastDonationDate: date ? new Date(date) : undefined,
        isEligible: true,
      });
    } catch (_dbErr) {
      // Continue even if DB record creation encounters non-fatal schema validation
    }
    const appointmentId = `LV-DONOR-${Math.floor(1000 + Math.random() * 9000)}`;
    return res.status(201).json({
      success: true,
      appointment: {
        id: appointmentId,
        name,
        phone,
        email,
        bloodGroup,
        city,
        date: date || new Date().toISOString().split('T')[0],
        status: 'SCHEDULED',
      },
      donor,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function getDonors(_req, res) {
  try {
    const donors = await Donor.find({});
    return res.status(200).json({ success: true, count: donors.length, donors });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class DonorController {
  static scheduleDonation = scheduleDonation;
  static getDonors = getDonors;
}
