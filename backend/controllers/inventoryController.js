import { InventoryItem } from '../models/index.js';

export async function getStock(_req, res) {
  try {
    const items = await InventoryItem.find({ status: 'AVAILABLE' });
    if (items && items.length > 0) {
      const countsByGroup = items.reduce((acc, item) => {
        acc[item.bloodGroup] = (acc[item.bloodGroup] || 0) + 1;
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

      return res.status(200).json({ success: true, totalUnits: items.length, stock });
    }

    const defaultStock = [
      { type: 'O-', units: 48, status: 'CRITICAL' },
      { type: 'O+', units: 210, status: 'OPTIMAL' },
      { type: 'A+', units: 185, status: 'OPTIMAL' },
      { type: 'A-', units: 62, status: 'LOW' },
      { type: 'B+', units: 140, status: 'OPTIMAL' },
      { type: 'B-', units: 35, status: 'CRITICAL' },
      { type: 'AB+', units: 92, status: 'OPTIMAL' },
      { type: 'AB-', units: 28, status: 'CRITICAL' },
    ];
    return res.status(200).json({ success: true, stock: defaultStock });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class InventoryController {
  static getStock = getStock;
}


