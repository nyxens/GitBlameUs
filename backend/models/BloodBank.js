import mongoose from 'mongoose';

const { Schema } = mongoose;

export const bloodBankSchema = new Schema(
  {
    bank_name: {
      type: String,
      required: [true, 'Blood bank name is required'],
      trim: true,
      index: true,
    },
    pincode: {
      type: String,
      required: [true, 'Blood bank pincode is required'],
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
    contact_no: {
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
    latitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Support geo queries once lat/lng is populated
bloodBankSchema.index({ latitude: 1, longitude: 1 });

// Virtual for ER diagram primary key naming: bank_id
bloodBankSchema.virtual('bank_id').get(function () {
  return this._id;
});

// Backward-compatible virtual aliases
bloodBankSchema.virtual('name').get(function () {
  return this.bank_name;
});

export const BloodBankSchema = bloodBankSchema;
export const BloodBank = mongoose.models.BloodBank || mongoose.model('BloodBank', bloodBankSchema);
export default BloodBank;