import { Hospital, Inventory } from '../models/index.js';

export async function authenticateHospital(req, res) {
  try {
    const { hos_name, pincode } = req.body;
    let hospital = await Hospital.findOne({ hos_name });
    if (!hospital) {
      // Find or link inventory
      const inv = await Inventory.findOne({});
      hospital = await Hospital.create({
        hos_name: hos_name || 'St. Jude General Hospital',
        pincode: pincode || '10001',
        I_Id: inv ? inv._id : null,
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
    const hospitals = await Hospital.find({}).populate('I_Id').populate('admin_id', 'username email');
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
