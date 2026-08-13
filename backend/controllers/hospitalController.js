import { Hospital } from '../models/index.js';

export class HospitalController {
  static async authenticate(req, res) {
    try {
      const { licenseId, hospitalName, city } = req.body;
      let hospital = await Hospital.findOne({ licenseId });
      if (!hospital) {
        hospital = await Hospital.create({
          name: hospitalName || 'New Hospital Node',
          licenseId: licenseId || `HOSP-LIC-${Math.floor(1000 + Math.random() * 9000)}`,
          city: city || 'Unknown City',
          networkNode: `NODE-${Math.floor(100 + Math.random() * 900)}`,
          isVerified: true,
        });
      }
      return res.status(200).json({
        success: true,
        hospital,
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getHospitals(_req, res) {
    try {
      const hospitals = await Hospital.find({});
      return res.status(200).json({ success: true, count: hospitals.length, hospitals });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

