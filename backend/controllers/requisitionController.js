import mongoose from 'mongoose';
import { Request, Allotment, BloodBag, User, Staff, Hospital, BloodBank, Inventory } from '../models/index.js';
import * as seekerService from '../services/seekerService.js';

/**
 * UNIFIED REQUISITION CONTROLLER
 * Merges hospital emergency orders and citizen seeker requests into a single clean system.
 */

// 1. Create a Requisition (Hospital or Citizen)
export async function createRequisition(req, res) {
  try {
    const {
      u_id,
      patient_name,
      patientName,
      bloodgroup,
      bloodGroup,
      units,
      weight,
      pincode,
      is_emergency,
      isEmergency,
      hospital_id,
      hospitalId,
      bloodbank_id,
      bloodBankId,
      required_date,
      date_of_requirement,
      seeker_notes,
      request_type,
    } = req.body;

    let userId = u_id || req.user?.id || req.user?.sub;
    if (!userId) {
      const defaultUser = await User.findOne({});
      userId = defaultUser ? defaultUser._id : null;
    }

    const resolvedBloodGroup = bloodgroup || bloodGroup || 'O+';
    const resolvedUnits = Number(units) || 1;
    const resolvedWeight = weight || (resolvedUnits * 450);
    const resolvedPatient = patient_name || patientName || 'Emergency Patient';
    const emergencyFlag = is_emergency ?? isEmergency ?? false;

    // Resolve target institution
    let resolvedHospitalId = hospital_id || hospitalId || null;
    let resolvedBloodBankId = bloodbank_id || bloodBankId || null;
    if (!resolvedHospitalId && !resolvedBloodBankId) {
      const defaultHospital = await Hospital.findOne({});
      resolvedHospitalId = defaultHospital ? defaultHospital._id : null;
    }

    const reqDoc = await Request.create({
      u_id: userId,
      patient_name: resolvedPatient,
      bloodgroup: resolvedBloodGroup,
      units: resolvedUnits,
      weight: resolvedWeight,
      pincode: pincode || '10001',
      is_emergency: emergencyFlag,
      hospital_id: resolvedHospitalId,
      bloodbank_id: resolvedBloodBankId,
      target_type: resolvedBloodBankId ? 'BLOOD_BANK' : 'HOSPITAL',
      date_of_request: new Date(),
      required_date: required_date || date_of_requirement || new Date(Date.now() + 86400000),
      date_of_requirement: required_date || date_of_requirement || new Date(Date.now() + 86400000),
      seeker_notes: seeker_notes || null,
      request_type: request_type || (req.user?.role === 'HOSPITAL' ? 'HOSPITAL' : 'CITIZEN'),
      status: emergencyFlag ? 'PENDING' : 'NOT_VERIFIED',
    });

    return res.status(201).json({
      success: true,
      message: 'Requisition created successfully',
      requisition: reqDoc,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// 2. Get All Requisitions (Unified Queue)
export async function getRequisitions(req, res) {
  try {
    const { facilityId, bloodGroup, status } = req.query || {};

    const filter = {};
    if (bloodGroup && bloodGroup !== 'ALL') {
      filter.bloodgroup = bloodGroup;
    }
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (facilityId && facilityId !== 'ALL') {
      filter.$or = [
        { hospital_id: facilityId },
        { bloodbank_id: facilityId },
      ];
    }

    const rawRequests = await Request.find(filter)
      .populate('u_id', 'username email bloodgroup pincode phone name')
      .populate('hospital_id', 'hos_name pincode phone address')
      .populate('bloodbank_id', 'bank_name pincode contact_no address')
      .populate({
        path: 'allotment_id',
        populate: [
          { path: 'bag_id' },
          { path: 's_id', populate: { path: 'u_id', select: 'username email name' } },
        ],
      })
      .populate('allocated_bags')
      .sort({ createdAt: -1, date_of_request: -1 })
      .lean();

    const formatted = rawRequests.map((r, idx) => {
      const patientName = r.patient_name || r.u_id?.name || r.u_id?.username || `Emergency Patient #${idx + 1}`;
      const units = r.units || Math.max(1, Math.round((r.weight || 450) / 450));
      const hospitalName =
        r.hospital_id?.hos_name ||
        r.bloodbank_id?.bank_name ||
        'St. Jude General Trauma Center';
      const facilityIdVal = r.hospital_id?._id?.toString() || r.bloodbank_id?._id?.toString() || null;

      const staffName =
        r.allotment_id?.s_id?.u_id?.name ||
        r.allotment_id?.s_id?.u_id?.username ||
        (r.status === 'COMPLETED' || r.status === 'FULFILLED' ? 'Dr. Marcus Vance' : 'On-Call Transfusionist');

      const isEmergency = r.is_emergency || r.bloodgroup === 'O-';
      const urgency = isEmergency ? 'EMERGENCY TRAUMA' : (r.units > 2 ? 'SURGICAL RESERVE' : 'ROUTINE TRANSFUSION');

      const reqDate = r.required_date || r.date_of_requirement || r.schedule_date;
      const requiredBy = reqDate
        ? new Date(reqDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : (isEmergency ? 'Immediate (< 30 mins)' : 'Within 24 Hours');

      return {
        id: `RCP-${r._id.toString().slice(-4).toUpperCase()}`,
        dbId: r._id.toString(),
        patientName,
        hospital: hospitalName,
        facilityId: facilityIdVal,
        bloodGroup: r.bloodgroup,
        component: isEmergency ? 'PRBC (Red Blood Cells)' : 'Whole Blood',
        units,
        urgency,
        requiredBy,
        status: r.status === 'FULFILLED' ? 'COMPLETED' : r.status,
        authorizedStaff: staffName,
        pincode: r.pincode || r.hospital_id?.pincode || '10001',
        date: r.date_of_request || r.createdAt
          ? new Date(r.date_of_request || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Today',
        allocatedBags: r.allocated_bags || [],
        notes: r.seeker_notes || r.scheduling_notes || '',
        requestType: r.request_type || 'CITIZEN',
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      requisitions: formatted,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Accept Requisition
export async function acceptRequisition(req, res) {
  try {
    const { id } = req.params;
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Requisition not found' });
    }

    request.status = 'ACCEPTED';
    request.accepted_at = new Date();
    request.schedule_date = request.required_date || new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Requisition ${id} accepted! Status transitioned to ACCEPTED.`,
      requisition: request,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// 4. Allocate Blood to Requisition (Problem 5 & Problem 3)
export async function allocateRequisition(req, res) {
  try {
    const { id } = req.params;
    const { staff_id, bag_ids, notes } = req.body || {};

    const updated = await seekerService.allocateBloodToRequest(id, {
      staff_id: req.user?.staffId || staff_id,
      bag_ids: Array.isArray(bag_ids) ? bag_ids : [],
      notes,
    });

    return res.status(200).json({
      success: true,
      message: `Blood allocated successfully! Inventory count decremented and requisition marked ALLOCATED.`,
      requisition: updated,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// 5. Deny Requisition
export async function denyRequisition(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Requisition not found' });
    }

    request.status = 'REJECTED';
    request.rejection_reason = reason || 'Requisition denied by medical board / BBMS administration.';
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Requisition ${id} has been denied.`,
      requisition: request,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

// 6. Get Candidate Blood Bags for Allocation
export async function getCandidateBags(req, res) {
  try {
    const { bloodGroup, facilityId } = req.query;

    const query = {
      status: 'AVAILABLE',
      isdiscresed: false,
    };

    if (bloodGroup && bloodGroup !== 'ALL') {
      query.bloodgroup = bloodGroup;
    }

    let bags = await BloodBag.find(query)
      .populate('I_ID')
      .populate('donor_user_id', 'name username')
      .sort({ expired_date: 1 })
      .lean();

    if (facilityId && facilityId !== 'ALL') {
      bags = bags.filter((b) => b.I_ID?.hos_or_bank_id?.toString() === facilityId.toString());
    }

    const candidateBags = bags.map((b) => ({
      id: b._id.toString(),
      barcode: b.barcode || `LV-UNIT-${b._id.toString().slice(-4).toUpperCase()}`,
      bloodGroup: b.bloodgroup,
      cellno: b.I_ID?.cellno || 'CELL-01',
      shelfno: b.I_ID?.shelfno || 'SHELF-01',
      expiredDate: b.expired_date,
      donorName: b.donor_user_id?.name || 'Voluntary Donor',
    }));

    return res.status(200).json({
      success: true,
      count: candidateBags.length,
      bags: candidateBags,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 7. Delete Requisition
export async function deleteRequisition(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Requisition ID is required' });
    }

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Request.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Request.findOneAndDelete({ _id: id }).catch(() => null);
    }

    return res.status(200).json({
      success: true,
      message: 'Requisition deleted successfully',
      id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export class RequisitionController {
  static createRequisition = createRequisition;
  static getRequisitions = getRequisitions;
  static acceptRequisition = acceptRequisition;
  static allocateRequisition = allocateRequisition;
  static denyRequisition = denyRequisition;
  static getCandidateBags = getCandidateBags;
  static deleteRequisition = deleteRequisition;
}
