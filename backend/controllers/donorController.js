import { Donor } from '../models/index.js';

export class DonorController {
  static async scheduleDonation(req, res) {
    try {
      const { name, phone, email, bloodGroup, city } = req.body;
      const donor = await Donor.create({
        name,
        phone,
        email,
        bloodGroup,
        city,
        isEligible: true,
      });
      return res.status(201).json({
        success: true,
        donor,
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getDonors(_req, res) {
    try {
      const donors = await Donor.find({});
      return res.status(200).json({ success: true, count: donors.length, donors });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

