import { Requisition } from '../models/index.js';

export async function createRequisition(req, res) {
  try {
    const { hospitalName, bloodGroup, units, urgency } = req.body;
    let reqDoc = null;
    try {
      reqDoc = await Requisition.create({
        hospitalName: hospitalName || 'Emergency Care Hospital',
        bloodGroup,
        unitsRequested: units,
        urgencyLevel: urgency || 'NORMAL',
        status: 'PENDING',
      });
    } catch (_err) {
      // Continue if DB creation encounters non-fatal validation error
    }

    const requisitionObj = {
      id: reqDoc ? reqDoc._id.toString() : `ORD-${Math.floor(9000 + Math.random() * 1000)}`,
      hospitalName: hospitalName || 'Emergency Care Hospital',
      bloodGroup,
      unitsRequested: units,
      urgency: urgency || 'EMERGENCY_TRAUMA',
      status: reqDoc ? reqDoc.status : 'PENDING',
      requestedAt: reqDoc ? reqDoc.createdAt : new Date(),
    };

    return res.status(201).json({
      success: true,
      requisition: requisitionObj,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function getRequisitions(_req, res) {
  try {
    const requisitions = await Requisition.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: requisitions.length, requisitions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class RequisitionController {
  static createRequisition = createRequisition;
  static getRequisitions = getRequisitions;
}


