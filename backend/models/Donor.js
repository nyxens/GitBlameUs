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

export const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    donorId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Donor phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      min: [18, 'Donor must be at least 18 years old'],
      max: [65, 'Donor must be under 65 years old'],
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    weightKg: {
      type: Number,
      min: [45, 'Weight must be at least 45kg for donation eligibility'],
      default: 50,
    },
    hemoglobin: {
      type: Number,
      min: [0, 'Hemoglobin must be positive'],
    },
    isEligible: {
      type: Boolean,
      default: true,
      index: true,
    },
    eligibilityStatus: {
      type: String,
      enum: ['ELIGIBLE', 'INELIGIBLE', 'TEMPORARY_DEFERRAL', 'PERMANENT_DEFERRAL'],
      default: 'ELIGIBLE',
    },
    deferralReason: {
      type: String,
      trim: true,
    },
    deferralUntil: {
      type: Date,
    },
    totalDonationsCount: {
      type: Number,
      default: 0,
    },
    lastDonationDate: {
      type: Date,
    },
    digitalBadge: {
      type: String,
      enum: ['BRONZE_HERO', 'SILVER_LIFESAVER', 'GOLD_GUARDIAN', 'PLATINUM_CHAMPION'],
      default: 'BRONZE_HERO',
    },
    address: addressSchema,
  },
  {
    timestamps: true,
  }
);

// Compound index for emergency callout searches
donorSchema.index({ bloodGroup: 1, city: 1, isEligible: 1 });

export const DonorSchema = donorSchema;
export const Donor = mongoose.models.Donor || mongoose.model('Donor', donorSchema);
export default Donor;
