import { BloodBag, Inventory, Donor } from '../models/index.js';
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
export async function getInventoryItems(req, res) {
  try {
    const targetFacilityId = req.query?.facilityId || req.query?.institutionId;

    let bagsQuery = BloodBag.find({ isdiscresed: false })
      .populate('donor_user_id', 'name username email phone bloodgroup')
      .populate('donor_request_id')
      .populate({
        path: 'I_ID',
        populate: { path: 'hos_or_bank_id' },
      })
      .sort({ createdAt: -1 });

    const rawBags = await bagsQuery.lean();

    // Map donor records for bags where donor_user_id is not set directly
    const bagIds = rawBags.map((b) => b._id);
    const donorRecords = await Donor.find({ bag_id: { $in: bagIds } })
      .populate('u_id', 'name username')
      .lean();

    const donorByBagId = {};
    for (const d of donorRecords) {
      if (d.bag_id) {
        donorByBagId[d.bag_id.toString()] = d.u_id?.name || d.u_id?.username;
      }
    }

    // Extract all unique facilities for dropdown switcher
    const facilityMap = new Map();
    for (const bag of rawBags) {
      const f = bag.I_ID?.hos_or_bank_id;
      if (f && f._id) {
        facilityMap.set(f._id.toString(), {
          id: f._id.toString(),
          name: f.bank_name || f.hos_name || 'Regional Facility',
          type: bag.I_ID?.hos_or_bank_type || 'BloodBank',
        });
      }
    }
    const facilities = Array.from(facilityMap.values());

    // Filter by facility if specified
    const bags = (targetFacilityId && targetFacilityId !== 'ALL')
      ? rawBags.filter((b) => {
          const fId = b.I_ID?.hos_or_bank_id?._id?.toString() || b.I_ID?.hos_or_bank_id?.toString();
          return fId === targetFacilityId;
        })
      : rawBags;

    const items = bags.map((bag, idx) => {
      const isUnfulfilled = bag.status === 'UNFULFILLED';
      const donorName =
        bag.donor_user_id?.name ||
        bag.donor_user_id?.username ||
        donorByBagId[bag._id.toString()] ||
        'Voluntary Donor';

      const barcode = bag.barcode || `LV-UNIT-${bag._id.toString().slice(-4).toUpperCase()}`;

      // Calculate component and temperature based on storage locker and blood type
      const cellno = bag.I_ID?.cellno || 'CELL-01';
      let component = 'Whole Blood';
      let temp = '2.4°C';

      if (isUnfulfilled) {
        component = 'Whole Blood (Inbound Donation)';
        temp = 'Pre-Intake';
      } else if (cellno.includes('CRYOBANK') || cellno.includes('PLASMA')) {
        component = 'FFP (Fresh Frozen Plasma)';
        temp = '-18.2°C';
      } else if (bag.weight && bag.weight < 350) {
        component = 'Platelets (Single Donor)';
        temp = '22.1°C';
      } else if (bag.bloodgroup === 'O-' || bag.bloodgroup === 'B-') {
        component = 'PRBC (Packed Red Cells)';
        temp = '2.4°C';
      }

      // Calculate FEFO expiration days and reserve status
      let expiry = '35 Days';
      let status = isUnfulfilled ? 'UNFULFILLED' : bag.status === 'AVAILABLE' ? 'OPTIMAL' : bag.status;

      if (bag.expired_date) {
        const diffDays = Math.ceil((new Date(bag.expired_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) {
          expiry = 'Expired (FEFO)';
          if (!isUnfulfilled && status === 'OPTIMAL') status = 'EXPIRED';
        } else if (diffDays <= 5) {
          expiry = `${diffDays} Days (FEFO #${idx + 1})`;
          if (!isUnfulfilled && status === 'OPTIMAL') status = 'CRITICAL';
        } else if (diffDays <= 14) {
          expiry = `${diffDays} Days`;
          if (!isUnfulfilled && status === 'OPTIMAL') status = 'LOW';
        } else {
          expiry = `${diffDays} Days`;
        }
      }

      return {
        id: bag._id.toString(),
        barcode,
        type: bag.bloodgroup,
        bloodGroup: bag.bloodgroup,
        component,
        units: 1,
        expiry: isUnfulfilled ? 'Awaiting Receipt' : expiry,
        temp,
        status,
        rawStatus: bag.status,
        donorName,
        donorRequestId: bag.donor_request_id?._id || bag.donor_request_id,
        dateOfDonation: bag.date_of_donation,
        cellno: bag.I_ID?.cellno || 'CELL-01',
        shelfno: bag.I_ID?.shelfno || 'SHELF-01',
        facilityName:
          bag.I_ID?.hos_or_bank_id?.bank_name ||
          bag.I_ID?.hos_or_bank_id?.hos_name ||
          (bag.I_ID?.hos_or_bank_type === 'BloodBank' ? 'Regional Blood Bank' : 'General Hospital'),
        facilityId:
          bag.I_ID?.hos_or_bank_id?._id?.toString() ||
          bag.I_ID?.hos_or_bank_id?.toString() ||
          null,
        facilityType: bag.I_ID?.hos_or_bank_type || 'BloodBank',
      };
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
      facilities,
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
