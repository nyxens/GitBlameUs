export const DonorSchema = {
  id: String,
  userId: String,
  name: String,
  phone: String,
  email: String,
  bloodGroup: String,
  city: String,
  weightKg: Number,
  isEligible: Boolean,
  totalDonationsCount: Number,
  lastDonationDate: Date,
};
