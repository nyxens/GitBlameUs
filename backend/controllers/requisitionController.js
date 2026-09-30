import mongoose from 'mongoose';
import { Request as BloodRequest, Allotment, BloodBag, User, Staff } from '../models/index.js';

export async function createRequisition(req, res) {
  try {
    const { u_id, bloodgroup, weight, pincode, date_of_requirement } = req.body;

    let userId = u_id;
    if (!userId) {
      const defaultUser = await User.findOne({});
      userId = defaultUser ? defaultUser._id : null;
    }

    const reqDoc = await BloodRequest.create({
      u_id: userId,
      bloodgroup: bloodgroup || 'O+',
      weight: weight || 1,
      pincode: pincode || '10001',
      date_of_request: new Date(),
      date_of_requirement: date_of_requirement ? new Date(date_of_requirement) : new Date(Date.now() + 86400000),
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      requisition: reqDoc,
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function getRequisitions(_req, res) {
  try {
    const requisitions = await BloodRequest.find({})
      .populate('u_id', 'username email bloodgroup pincode phone')
      .populate({
        path: 'A_id',
        populate: [
          { path: 'bag_id' },
          { path: 's_id', populate: { path: 'u_id', select: 'username email' } },
        ],
      })
      .sort({ date_of_request: -1 });

    return res.status(200).json({ success: true, count: requisitions.length, requisitions });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteRequisition(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Requisition ID is required' });
    }

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await BloodRequest.findByIdAndDelete(id);
    }

    if (!deleted) {
      deleted = await BloodRequest.findOneAndDelete({ _id: id }).catch(() => null);
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
  static deleteRequisition = deleteRequisition;
}

