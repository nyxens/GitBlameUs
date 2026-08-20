import mongoose from 'mongoose';

const infectiousDiseasesSchema = new mongoose.Schema(
  {
    hiv: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'NEGATIVE',
    },
    hepatitisB: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'NEGATIVE',
    },
    hepatitisC: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'NEGATIVE',
    },
    syphilis: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'NEGATIVE',
    },
    malaria: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'NEGATIVE',
    },
  },
  { _id: false }
);

export const labScreeningSchema = new mongoose.Schema(
  {
    screeningId: {
      type: String,
      required: [true, 'Screening ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: [true, 'Unit reference is required'],
      index: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      index: true,
    },
    bloodGroupVerified: {
      type: String,
      required: [true, 'Verified blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    infectiousDiseases: {
      type: infectiousDiseasesSchema,
      default: () => ({}),
    },
    crossMatchStatus: {
      type: String,
      enum: ['COMPATIBLE', 'INCOMPATIBLE', 'NOT_TESTED'],
      default: 'NOT_TESTED',
    },
    hemoglobinLevel: {
      type: Number,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    technicianSignature: {
      type: String,
      trim: true,
    },
    overallResult: {
      type: String,
      enum: ['PASSED', 'FAILED', 'PENDING'],
      default: 'PENDING',
      index: true,
    },
    screeningDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const LabScreeningSchema = labScreeningSchema;
export const LabScreening = mongoose.models.LabScreening || mongoose.model('LabScreening', labScreeningSchema);
export default LabScreening;
