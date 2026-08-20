import mongoose from 'mongoose';

export const donationDriveSchema = new mongoose.Schema(
  {
    driveCode: {
      type: String,
      required: [true, 'Drive code is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Donation drive title is required'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    targetUnits: {
      type: Number,
      default: 100,
    },
    collectedUnits: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

donationDriveSchema.index({ city: 1, status: 1 });

export const DonationDriveSchema = donationDriveSchema;
export const DonationDrive = mongoose.models.DonationDrive || mongoose.model('DonationDrive', donationDriveSchema);
export default DonationDrive;
