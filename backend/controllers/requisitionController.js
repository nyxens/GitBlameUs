import { Requisition } from '../models/index.js';

export class RequisitionController {
  static async createRequisition(req, res) {
    try {
      const { hospitalName, bloodGroup, units, urgency } = req.body;
      const requisition = await Requisition.create({
        hospitalName: hospitalName || 'Emergency Care Hospital',
        bloodGroup,
        unitsRequested: units,
        urgencyLevel: urgency || 'NORMAL',
        status: 'PENDING',
      });
      return res.status(201).json({
        success: true,
        requisition,
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  static async getRequisitions(_req, res) {
    try {
      const requisitions = await Requisition.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: requisitions.length, requisitions });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

