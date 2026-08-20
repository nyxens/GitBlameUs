import mongoose from 'mongoose';

const { Schema } = mongoose;

export const hospitalSchema = new Schema(
  {
    hos_name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      index: true,
    },
    pincode: {
      type: String,
      required: [true, 'Hospital pincode is required'],
      trim: true,
      index: true,
    },
    I_Id: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      default: null,
      index: true,
    },
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: hos_id
hospitalSchema.virtual('hos_id').get(function () {
  return this._id;
});

// Backward-compatible virtual aliases
hospitalSchema.virtual('name').get(function () {
  return this.hos_name;
});

export const HospitalSchema = hospitalSchema;
export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
export default Hospital;
