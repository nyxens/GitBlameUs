import mongoose from 'mongoose';

const { Schema } = mongoose;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const BLOODBAG_STATUSES = [
  'UNFULFILLED', // Blood donation accepted, awaiting physical receipt by BBMS
  'FULFILLED',   // Blood physically received by BBMS and confirmed
  'AVAILABLE',   // Available in inventory for transfusion / matching
  'TESTING',
  'RESERVED',
  'ALLOCATED',
  'TRANSFUSED',
  'DISCARDED',
  'EXPIRED',
];

export const bloodBagSchema = new Schema(
  {
    bloodgroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: BLOOD_GROUPS,
      index: true,
    },
    haemoglobin: {
      type: Number,
      default: 13.5,
      min: [0, 'Haemoglobin cannot be negative'],
    },
    pressure: {
      type: String,
      default: '120/80 mmHg',
      trim: true,
    },
    date_of_donation: {
      type: Date,
      required: [true, 'Date of donation is required'],
      default: Date.now,
    },
    isdiscresed: {
      type: Boolean,
      default: false,
      index: true,
    },
    expired_date: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
    S_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff reference (S_Id) is required'],
      index: true,
    },
    I_ID: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'Inventory location reference (I_ID) is required'],
      index: true,
    },
    status: {
      type: String,
      enum: BLOODBAG_STATUSES,
      default: 'AVAILABLE',
      index: true,
    },
    weight: {
      type: Number,
      required: [true, 'Bag weight/volume is required'],
      default: 450,
      min: [0, 'Weight cannot be negative'],
    },
    maxcost: {
      type: Number,
      default: 0.0,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    donor_request_id: {
      type: Schema.Types.ObjectId,
      ref: 'GiverRequest',
      default: null,
      index: true,
    },
    donor_user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    fulfilled_at: {
      type: Date,
      default: null,
    },
    fulfilled_by: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: bag_id
bloodBagSchema.virtual('bag_id').get(function () {
  return this._id;
});

// Compound FEFO index: find available non-discarded matching units sorted by expiry
bloodBagSchema.index({ bloodgroup: 1, status: 1, isdiscresed: 1, expired_date: 1 });

export const BloodBagSchema = bloodBagSchema;
export const BloodBag = mongoose.models.BloodBag || mongoose.model('BloodBag', bloodBagSchema);
export default BloodBag;
