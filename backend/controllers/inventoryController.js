export class InventoryController {
  static async getStock(_req, res) {
    const stock = [
      { type: 'O-', units: 48, status: 'CRITICAL' },
      { type: 'O+', units: 210, status: 'OPTIMAL' },
      { type: 'A+', units: 185, status: 'OPTIMAL' },
      { type: 'A-', units: 62, status: 'LOW' },
      { type: 'B+', units: 140, status: 'OPTIMAL' },
      { type: 'B-', units: 35, status: 'CRITICAL' },
      { type: 'AB+', units: 92, status: 'OPTIMAL' },
      { type: 'AB-', units: 28, status: 'CRITICAL' },
    ];
    return res.status(200).json({ success: true, stock });
  }
}
