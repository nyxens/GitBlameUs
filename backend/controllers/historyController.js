import crypto from 'crypto';
import { BloodBag, Allotment } from '../models/index.js';

const staffPopulate = { path: 'u_id', select: 'name username' };
const facilityName = (f) => f?.hos_name || f?.bank_name || 'Unknown facility';
const staffLabel = (s) => (s ? `${s.u_id?.name || s.u_id?.username || 'Staff'} (${s.licence_id || s._id})` : 'Unassigned');
const ledgerHash = (payload) => `0x${crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16)}`;

/**
 * QUERY: Audit ledger built from real records — donation intakes (BloodBag) and allotments.
 * GET /api/v1/history
 */
export async function getHistory(_req, res, next) {
  try {
    const [bags, allotments] = await Promise.all([
      BloodBag.find({})
        .populate({ path: 'S_Id', select: 'licence_id u_id', populate: staffPopulate })
        .populate({ path: 'I_ID', select: 'hos_or_bank_id hos_or_bank_type', populate: { path: 'hos_or_bank_id', select: 'hos_name bank_name' } })
        .lean(),
      Allotment.find({})
        .populate({ path: 'bag_id', select: 'bloodgroup barcode weight expired_date status' })
        .populate({ path: 's_id', select: 'licence_id u_id', populate: staffPopulate })
        .populate({ path: 'req_id', select: 'pincode weight status u_id', populate: { path: 'u_id', select: 'name username' } })
        .lean(),
    ]);

    const events = [];

    for (const b of bags) {
      const ts = b.date_of_donation || b.createdAt;
      events.push({
        id: `INT-${String(b._id).slice(-6).toUpperCase()}`,
        type: 'DONATION_INTAKE',
        categoryLabel: 'Donation Intake',
        bagId: b.barcode || String(b._id),
        bloodGroup: b.bloodgroup,
        component: `${b.weight} ml`,
        entity: facilityName(b.I_ID?.hos_or_bank_id),
        authorizedStaff: staffLabel(b.S_Id),
        timestamp: ts,
        status: b.status,
        detail: `Hb ${b.haemoglobin} g/dL, BP ${b.pressure}, expires ${new Date(b.expired_date).toISOString().slice(0, 10)}.`,
      });
    }

    let expiredAllotted = 0;
    for (const a of allotments) {
      const bag = a.bag_id;
      if (bag?.expired_date && new Date(bag.expired_date) < new Date(a.date_of_allocation)) expiredAllotted += 1;
      events.push({
        id: `ALT-${String(a._id).slice(-6).toUpperCase()}`,
        type: 'BLOOD_ALLOTMENT',
        categoryLabel: 'Blood Allotment',
        bagId: bag?.barcode || String(bag?._id || a.bag_id),
        bloodGroup: bag?.bloodgroup || '—',
        component: bag ? `${bag.weight} ml` : '—',
        entity: a.req_id
          ? `${a.req_id.u_id?.name || a.req_id.u_id?.username || 'Recipient'} (pincode ${a.req_id.pincode || '—'})`
          : 'Requisition record not found',
        authorizedStaff: staffLabel(a.s_id),
        timestamp: a.date_of_allocation,
        status: a.req_id?.status || bag?.status || 'ALLOCATED',
        detail: a.req_id
          ? `Allocated to requisition ${String(a.req_id._id).slice(-6).toUpperCase()}.`
          : 'Allocated; the linked requisition no longer exists.',
      });
    }

    for (const e of events) {
      e.hash = ledgerHash(JSON.stringify([e.id, e.type, e.bagId, e.entity, e.authorizedStaff, e.timestamp, e.status]));
    }
    events.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp));

    return res.status(200).json({
      success: true,
      count: events.length,
      summary: {
        totalEvents: events.length,
        intakes: bags.length,
        allotments: allotments.length,
        expiredAllotted,
        availableUnits: bags.filter((b) => b.status === 'AVAILABLE').length,
      },
      data: events,
    });
  } catch (err) {
    next(err);
  }
}
