import mongoose from 'mongoose';

export const requisitionSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsRequested: {
      type: Number,
      required: [true, 'Units requested is required'],
      min: [1, 'Must request at least 1 unit'],
    },
    urgencyLevel: {
      type: String,
      enum: ['NORMAL', 'URGENT', 'CRITICAL'],
      default: 'NORMAL',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const RequisitionSchema = requisitionSchema;
export const Requisition = mongoose.models.Requisition || mongoose.model('Requisition', requisitionSchema);
export default Requisition;

