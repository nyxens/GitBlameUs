export class RequisitionController {
  static async createRequisition(req, res) {
    try {
      const { bloodGroup, units, urgency } = req.body;
      return res.status(201).json({
        success: true,
        requisition: {
          id: `ORD-${Math.floor(9000 + Math.random() * 1000)}`,
          bloodGroup,
          unitsRequested: units,
          urgency: urgency || 'EMERGENCY_TRAUMA',
          status: 'APPROVED',
          requestedAt: new Date(),
        },
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
}
