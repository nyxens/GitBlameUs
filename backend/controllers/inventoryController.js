import mongoose from 'mongoose';
import { BloodBag, Inventory } from '../models/index.js';
import * as giverService from '../services/giverService.js';

/** Inventory filter for the requester: admins see all, staff only their own hospital / blood bank. */
const inventoryFilter = (scope) =>
  scope.all ? {} : { hos_or_bank_id: scope.id, hos_or_bank_type: scope.type };

export async function getStock(req, res) {
  try {
    const inventories = await Inventory.find(inventoryFilter(req.scope));
    const items = await BloodBag.find({
      status: 'AVAILABLE',
      isdiscresed: false,
      I_ID: { $in: inventories.map((i) => i._id) },
    });

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
export async function getInventoryItems(req, res) {
  try {
    const inventoryIds = (await Inventory.find(inventoryFilter(req.scope)).select('_id').lean()).map((i) => i._id);
    const bags = await BloodBag.find({ isdiscresed: false, I_ID: { $in: inventoryIds } })
      .populate('donor_user_id', 'name username email phone bloodgroup')
      .populate('donor_request_id')
      .populate({ path: 'I_ID', populate: { path: 'hos_or_bank_id', select: 'hos_name bank_name' } })
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
        facility: bag.I_ID?.hos_or_bank_id?.hos_name || bag.I_ID?.hos_or_bank_id?.bank_name || null,
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

    if (!req.scope.all) {
      const bag = await BloodBag.findOne(mongoose.isValidObjectId(id) ? { $or: [{ _id: id }, { barcode: id }] } : { barcode: id }).select('I_ID').lean();
      const owned = bag && await Inventory.exists({ _id: bag.I_ID, ...inventoryFilter(req.scope) });
      if (!owned) {
        return res.status(403).json({ success: false, error: 'This unit belongs to another facility.' });
      }
    }

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

/**
 * Get available inventories and blood stock filtered by pincode
 * GET /api/v1/inventory/by-pincode?pincode=...
 */
export async function getInventoriesByPincode(req, res) {
  try {
    const rawPincode = req.query.pincode || req.params.pincode || '';
    const pincode = String(rawPincode).trim();

    let inventories = [];
    let isFallbackNearby = false;

    if (pincode) {
      inventories = await Inventory.find({ pincode }).populate('hos_or_bank_id').lean();
    }

    // If no direct match or no pincode, retrieve all regional inventories
    if (!inventories.length) {
      inventories = await Inventory.find({}).populate('hos_or_bank_id').lean();
      if (pincode) isFallbackNearby = true;
    }

    const inventoryIds = inventories.map((inv) => inv._id);
    const availableBags = await BloodBag.find({
      I_ID: { $in: inventoryIds },
      status: 'AVAILABLE',
      isdiscresed: false,
    }).lean();

    const results = inventories.map((inv) => {
      const facility = inv.hos_or_bank_id;
      const facilityName =
        facility?.bank_name ||
        facility?.hos_name ||
        (inv.hos_or_bank_type === 'BloodBank' ? 'Regional Blood Bank Vault' : 'Hospital Trauma Center');

      const bagsInInv = availableBags.filter(
        (b) => b.I_ID && b.I_ID.toString() === inv._id.toString()
      );

      const countsByGroup = bagsInInv.reduce((acc, b) => {
        acc[b.bloodgroup] = (acc[b.bloodgroup] || 0) + 1;
        return acc;
      }, {});

      return {
        id: inv._id.toString(),
        inventoryId: inv._id.toString(),
        cellno: inv.cellno,
        shelfno: inv.shelfno,
        pincode: inv.pincode,
        facilityName,
        facilityType: inv.hos_or_bank_type,
        address: facility?.address || `Medical District Zone, Pincode ${inv.pincode}`,
        phone: facility?.contact_no || facility?.phone || '+1 (555) 019-2831',
        email: facility?.email || 'vault-telemetry@lifevault.org',
        capacity: inv.capacity || 100,
        currentCount: bagsInInv.length,
        countsByGroup,
        availableUnits: bagsInInv.length,
        temp: inv.cellno?.includes('CRYOBANK') ? '-18.2°C' : '2.4°C',
        isDirectMatch: !isFallbackNearby && inv.pincode === pincode,
      };
    });

    return res.status(200).json({
      success: true,
      pincode: pincode || null,
      isFallbackNearby,
      count: results.length,
      inventories: results,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class InventoryController {
  static getStock = getStock;
  static getInventoryItems = getInventoryItems;
  static fulfillInventoryItem = fulfillInventoryItem;
  static getInventoriesByPincode = getInventoriesByPincode;
}
