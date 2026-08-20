import { BloodBag, Inventory } from '../models/index.js';

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

export class InventoryController {
  static getStock = getStock;
}
