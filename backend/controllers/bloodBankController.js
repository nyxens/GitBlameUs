import mongoose from 'mongoose';
import { BloodBank, Inventory, BloodBag, Staff } from '../models/index.js';

/**
 * QUERY: Blood banks with their inventory & stock. Admin: all; staff: only their own blood bank.
 * GET /api/v1/bloodbanks
 */
export async function getBloodBanks(req, res) {
  try {
    const { scope } = req;
    const filter = scope.all ? {} : scope.type === 'BloodBank' ? { _id: scope.id } : { _id: null };
    const bloodBanks = await BloodBank.find(filter).sort({ bank_name: 1 }).lean();

    const inventories = await Inventory.find({
      hos_or_bank_type: 'BloodBank',
      hos_or_bank_id: { $in: bloodBanks.map((b) => b._id) },
    }).lean();
    const stock = await BloodBag.aggregate([
      { $match: { I_ID: { $in: inventories.map((i) => i._id) }, status: 'AVAILABLE', isdiscresed: false } },
      { $group: { _id: '$I_ID', units: { $sum: 1 } } },
    ]);
    const unitsByInventory = new Map(stock.map((s) => [String(s._id), s.units]));

    const data = bloodBanks.map((b) => {
      const invs = inventories
        .filter((i) => String(i.hos_or_bank_id) === String(b._id))
        .map((i) => ({ _id: i._id, cellno: i.cellno, shelfno: i.shelfno, capacity: i.capacity, units: unitsByInventory.get(String(i._id)) || 0 }));
      return { ...b, inventories: invs, units: invs.reduce((sum, i) => sum + i.units, 0) };
    });
    return res.status(200).json({ success: true, count: data.length, bloodBanks: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * COMMAND (admin): Add a blood bank together with its inventory.
 * POST /api/v1/bloodbanks
 */
export async function createBloodBank(req, res) {
  try {
    const { bank_name, pincode, contact_no, email, address, latitude, longitude, capacity } = req.body || {};
    if (!bank_name?.trim() || !pincode?.trim()) {
      return res.status(400).json({ success: false, error: 'Blood bank name and pincode are required.' });
    }
    const duplicate = await BloodBank.findOne({ bank_name: bank_name.trim() }).collation({ locale: 'en', strength: 2 });
    if (duplicate) {
      return res.status(409).json({ success: false, error: 'A blood bank with this name already exists.' });
    }

    const bloodBank = await BloodBank.create({
      bank_name, pincode, contact_no, email, address, latitude, longitude, admin_id: req.user.sub,
    });
    const inventory = await Inventory.create({
      cellno: 'CELL-01',
      shelfno: 'SHELF-01',
      pincode: bloodBank.pincode,
      hos_or_bank_id: bloodBank._id,
      hos_or_bank_type: 'BloodBank',
      capacity: Number(capacity) || 100,
    });
    bloodBank.I_Id = inventory._id;
    await bloodBank.save();

    return res.status(201).json({ success: true, message: 'Blood bank added.', bloodBank });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * COMMAND (admin): Delete a blood bank and its (empty) inventories.
 * Refused while the blood bank still has staff or blood bags.
 * DELETE /api/v1/bloodbanks/:id
 */
export async function deleteBloodBank(req, res) {
  try {
    const { id } = req.params;
    const bloodBank = mongoose.isValidObjectId(id) ? await BloodBank.findById(id) : null;
    if (!bloodBank) {
      return res.status(404).json({ success: false, error: 'Blood bank not found.' });
    }

    const inventoryIds = (await Inventory.find({ hos_or_bank_type: 'BloodBank', hos_or_bank_id: bloodBank._id }).select('_id').lean())
      .map((i) => i._id);
    const [staffCount, bagCount] = await Promise.all([
      Staff.countDocuments({ hos_or_bank_type: 'BloodBank', hos_or_bank_id: bloodBank._id }),
      BloodBag.countDocuments({ I_ID: { $in: inventoryIds } }),
    ]);
    if (staffCount || bagCount) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete: blood bank still has ${staffCount} staff member(s) and ${bagCount} blood bag(s). Remove or transfer them first.`,
      });
    }

    await Inventory.deleteMany({ _id: { $in: inventoryIds } });
    await bloodBank.deleteOne();
    return res.status(200).json({ success: true, message: 'Blood bank deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
