import { InventoryItem } from '../models/index.js';

export class InventoryController {
  static async getStock(_req, res) {
    try {
      const items = await InventoryItem.find({ status: 'AVAILABLE' });
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
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

