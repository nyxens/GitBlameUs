import mongoose from 'mongoose';

const dispatchDetailsSchema = new mongoose.Schema(
  {
    courierName: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    dispatchedAt: { type: Date },
    estimatedArrival: { type: Date },
    deliveredAt: { type: Date },
    currentStatus: { type: String, trim: true },
  },
  { _id: false }
);

export const requisitionSchema = new mongoose.Schema(
  {
    requisitionNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      index: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      index: true,
    },
    patientName: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    component: {
      type: String,
      enum: ['WHOLE_BLOOD', 'PRBC', 'RBC', 'PLATELETS', 'FFP', 'PLASMA', 'CRYO'],
      default: 'WHOLE_BLOOD',
    },
    unitsRequested: {
      type: Number,
      required: [true, 'Units requested is required'],
      min: [1, 'Must request at least 1 unit'],
    },
    unitsAllocated: {
      type: Number,
      default: 0,
    },
    allocatedUnitIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem',
      },
    ],
    urgencyLevel: {
      type: String,
      enum: ['NORMAL', 'URGENT', 'CRITICAL', 'EMERGENCY_TRAUMA', 'SURGICAL_RESERVE', 'ROUTINE'],
      default: 'NORMAL',
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'MATCHED', 'DISPATCHED', 'FULFILLED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    reasonForRequest: {
      type: String,
      trim: true,
    },
    targetHospitalAddress: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    requiredBy: {
      type: Date,
    },
    dispatchDetails: dispatchDetailsSchema,
  },
  {
    timestamps: true,
  }
);

// Compound index for triage queries and SLA tracking
requisitionSchema.index({ status: 1, urgencyLevel: 1, requestedAt: -1 });

export const RequisitionSchema = requisitionSchema;
export const Requisition = mongoose.models.Requisition || mongoose.model('Requisition', requisitionSchema);
export const BloodRequest = Requisition;
export default Requisition;
