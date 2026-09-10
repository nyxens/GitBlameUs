import { BloodBag, Inventory } from '../models/index.js';
import * as giverService from '../services/giverService.js';

export async function getStock(_req, res) {
  try {
    const items = await BloodBag.find({ status: 'AVAILABLE', isdiscresed: false });
    const inventories = await Inventory.find({});

    const countsByGroup = items.reduce((acc, item) => {
      acc[item.bloodgroup] = (acc[item.bloodgroup] || 0) + 1;
      return acc;
    }, {});

    const bloodTypes = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    const stock = bloodTypes.map((type) => {
      const units = countsByGroup[type] || 0;
      let status = 'OPTIMAL';
      if (units === 0 || units < 2) status = 'CRITICAL';
      else if (units < 5) status = 'LOW';

      return { type, units, status };
    });

    return res.status(200).json({
      success: true,
      totalUnits: items.length,
      stock,
      inventories,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get individual inventory items (blood bags + inbound unfulfilled donations)
 * GET /api/v1/inventory/items
 */
export async function getInventoryItems(_req, res) {
  try {
    const bags = await BloodBag.find({ isdiscresed: false })
      .populate('donor_user_id', 'name username email phone bloodgroup')
      .populate('donor_request_id')
      .populate('I_ID')
      .sort({ createdAt: -1 })
      .lean();

    const items = bags.map((bag, idx) => {
      const isUnfulfilled = bag.status === 'UNFULFILLED';
      const donorName = bag.donor_user_id?.name || bag.donor_user_id?.username || 'Voluntary Donor';
      const barcode = bag.barcode || `LV-UNIT-${8090 + idx}`;
      
      let expiry = '35 Days';
      if (bag.expired_date) {
        const diffDays = Math.ceil((new Date(bag.expired_date) - new Date()) / (1000 * 60 * 60 * 24));
        expiry = diffDays > 0 ? `${diffDays} Days` : 'Expired';
      }

      return {
        id: bag._id.toString(),
        barcode,
        type: bag.bloodgroup,
        bloodGroup: bag.bloodgroup,
        component: isUnfulfilled ? 'Whole Blood (Inbound Donation)' : 'Whole Blood',
        units: 1,
        expiry: isUnfulfilled ? 'Awaiting Receipt' : expiry,
        temp: isUnfulfilled ? 'Pre-Intake' : '2.4°C',
        status: isUnfulfilled ? 'UNFULFILLED' : bag.status === 'AVAILABLE' ? 'OPTIMAL' : bag.status,
        rawStatus: bag.status,
        donorName,
        donorRequestId: bag.donor_request_id?._id || bag.donor_request_id,
        dateOfDonation: bag.date_of_donation,
        cellno: bag.I_ID?.cellno || 'CELL-01',
        shelfno: bag.I_ID?.shelfno || 'SHELF-01',
      };
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Fulfill an inventory entry when BBMS receives the blood
 * PUT /api/v1/inventory/fulfill/:id
 */
export async function fulfillInventoryItem(req, res) {
  try {
    const { id } = req.params;
    const { staff_id, haemoglobin, pressure, weight } = req.body || {};

    const result = await giverService.fulfillDonationReceipt(id, {
      staff_id: req.user?.staffId || staff_id,
      haemoglobin,
      pressure,
      weight,
    });

    return res.status(200).json({
      success: true,
      message: 'Blood donation received into BBMS vault! Inventory entry fulfilled.',
      data: result,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export class InventoryController {
  static getStock = getStock;
  static getInventoryItems = getInventoryItems;
  static fulfillInventoryItem = fulfillInventoryItem;
}
