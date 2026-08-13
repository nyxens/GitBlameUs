import { Hospital } from '../models/index.js';

export async function authenticateHospital(req, res) {
  try {
    const { licenseId, hospitalName, city } = req.body;
    let hospital = null;
    if (licenseId) {
      hospital = await Hospital.findOne({ licenseId });
    }
    if (!hospital) {
      hospital = await Hospital.create({
        name: hospitalName || 'St. Jude General Hospital',
        licenseId: licenseId || `HOSP-LIC-${Math.floor(1000 + Math.random() * 9000)}`,
        city: city || 'Unknown City',
        networkNode: 'NODE-EAST-01',
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

export async function getHospitals(_req, res) {
  try {
    const hospitals = await Hospital.find({});
    return res.status(200).json({ success: true, count: hospitals.length, hospitals });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class HospitalController {
  static authenticate = authenticateHospital;
  static authenticateHospital = authenticateHospital;
  static getHospitals = getHospitals;
}


