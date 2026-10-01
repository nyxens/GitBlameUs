import mongoose from 'mongoose';

const { Schema } = mongoose;

export const donorSchema = new Schema(
  {
    u_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference (u_id) is required'],
      index: true,
    },
    date_of_donation: {
      type: Date,
      required: [true, 'Date of donation is required'],
      default: Date.now,
      index: true,
    },
    weight_donated: {
      type: Number,
      required: [true, 'Weight/volume donated is required (in ml/grams)'],
      min: [0, 'Weight donated cannot be negative'],
    },
    bag_id: {
      type: Schema.Types.ObjectId,
      ref: 'BloodBag',
      default: null,
      unique: true,
      sparse: true,
      index: true,
    },
    S_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null, // unknown when an admin (not a staff member) handles the unit
      index: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: D_Id
donorSchema.virtual('D_Id').get(function () {
  return this._id;
});

// Backward-compatible virtual aliases
donorSchema.virtual('userId').get(function () {
  return this.u_id;
});

export const DonorSchema = donorSchema;
export const Donor = mongoose.models.Donor || mongoose.model('Donor', donorSchema);
export default Donor;
