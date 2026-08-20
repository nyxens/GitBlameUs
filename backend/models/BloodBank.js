import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

export const bloodBankSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Blood bank code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Blood bank name is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    operatingHours: {
      type: String,
      default: '24/7',
    },
    storageCapacityUnits: {
      type: Number,
      default: 5000,
    },
    activeAlertsCount: {
      type: Number,
      default: 0,
    },
    address: addressSchema,
  },
  {
    timestamps: true,
  }
);

export const BloodBankSchema = bloodBankSchema;
export const BloodBank = mongoose.models.BloodBank || mongoose.model('BloodBank', bloodBankSchema);
export default BloodBank;
