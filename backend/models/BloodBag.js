import mongoose from 'mongoose';

const { Schema } = mongoose;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const BLOODBAG_STATUSES = ['AVAILABLE', 'TESTING', 'RESERVED', 'ALLOCATED', 'TRANSFUSED', 'DISCARDED', 'EXPIRED'];

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
      required: [true, 'Haemoglobin level is required'],
      min: [0, 'Haemoglobin cannot be negative'],
    },
    pressure: {
      type: String,
      required: [true, 'Blood pressure reading is required'],
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
      min: [0, 'Weight cannot be negative'],
    },
    maxcost: {
      type: Number,
      default: 0.0,
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
