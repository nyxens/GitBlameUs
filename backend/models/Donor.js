import mongoose from 'mongoose';

export const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    weightKg: {
      type: Number,
      min: [45, 'Weight must be at least 45kg for donation eligibility'],
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    totalDonationsCount: {
      type: Number,
      default: 0,
    },
    lastDonationDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const DonorSchema = donorSchema;
export const Donor = mongoose.models.Donor || mongoose.model('Donor', donorSchema);
export default Donor;

