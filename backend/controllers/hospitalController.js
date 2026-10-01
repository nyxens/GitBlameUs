import mongoose from 'mongoose';
import { Hospital, Inventory, BloodBag, Staff } from '../models/index.js';

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

/**
 * QUERY: Hospitals with their inventory & stock. Admin: all hospitals; staff: only their own.
 * GET /api/v1/hospitals
 */
export async function getHospitals(req, res) {
  try {
    const { scope } = req;
    const filter = scope.all ? {} : scope.type === 'Hospital' ? { _id: scope.id } : { _id: null };
    const hospitals = await Hospital.find(filter).sort({ hos_name: 1 }).lean();

    const inventories = await Inventory.find({
      hos_or_bank_type: 'Hospital',
      hos_or_bank_id: { $in: hospitals.map((h) => h._id) },
    }).lean();
    const stock = await BloodBag.aggregate([
      { $match: { I_ID: { $in: inventories.map((i) => i._id) }, status: 'AVAILABLE', isdiscresed: false } },
      { $group: { _id: '$I_ID', units: { $sum: 1 } } },
    ]);
    const unitsByInventory = new Map(stock.map((s) => [String(s._id), s.units]));

    const data = hospitals.map((h) => {
      const invs = inventories
        .filter((i) => String(i.hos_or_bank_id) === String(h._id))
        .map((i) => ({ _id: i._id, cellno: i.cellno, shelfno: i.shelfno, capacity: i.capacity, units: unitsByInventory.get(String(i._id)) || 0 }));
      return { ...h, inventories: invs, units: invs.reduce((sum, i) => sum + i.units, 0) };
    });
    return res.status(200).json({ success: true, count: data.length, hospitals: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * COMMAND (admin): Add a hospital together with its inventory.
 * POST /api/v1/hospitals
 */
export async function createHospital(req, res) {
  try {
    const { hos_name, pincode, phone, email, address, latitude, longitude, capacity } = req.body || {};
    if (!hos_name?.trim() || !pincode?.trim()) {
      return res.status(400).json({ success: false, error: 'Hospital name and pincode are required.' });
    }
    const duplicate = await Hospital.findOne({ hos_name: hos_name.trim() }).collation({ locale: 'en', strength: 2 });
    if (duplicate) {
      return res.status(409).json({ success: false, error: 'A hospital with this name already exists.' });
    }

    const hospital = await Hospital.create({
      hos_name, pincode, phone, email, address, latitude, longitude, admin_id: req.user.sub,
    });
    const inventory = await Inventory.create({
      cellno: 'CELL-01',
      shelfno: 'SHELF-01',
      pincode: hospital.pincode,
      hos_or_bank_id: hospital._id,
      hos_or_bank_type: 'Hospital',
      capacity: Number(capacity) || 100,
    });
    hospital.I_Id = inventory._id;
    await hospital.save();

    return res.status(201).json({ success: true, message: 'Hospital added.', hospital });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * COMMAND (admin): Delete a hospital and its (empty) inventories.
 * Refused while the hospital still has staff or blood bags.
 * DELETE /api/v1/hospitals/:id
 */
export async function deleteHospital(req, res) {
  try {
    const { id } = req.params;
    const hospital = mongoose.isValidObjectId(id) ? await Hospital.findById(id) : null;
    if (!hospital) {
      return res.status(404).json({ success: false, error: 'Hospital not found.' });
    }

    const inventoryIds = (await Inventory.find({ hos_or_bank_type: 'Hospital', hos_or_bank_id: hospital._id }).select('_id').lean())
      .map((i) => i._id);
    const [staffCount, bagCount] = await Promise.all([
      Staff.countDocuments({ hos_or_bank_type: 'Hospital', hos_or_bank_id: hospital._id }),
      BloodBag.countDocuments({ I_ID: { $in: inventoryIds } }),
    ]);
    if (staffCount || bagCount) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete: hospital still has ${staffCount} staff member(s) and ${bagCount} blood bag(s). Remove or transfer them first.`,
      });
    }

    await Inventory.deleteMany({ _id: { $in: inventoryIds } });
    await hospital.deleteOne();
    return res.status(200).json({ success: true, message: 'Hospital deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
