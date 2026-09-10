import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * =======================================================================================
 * GIVER / DONOR REQUEST WORKFLOW
 * =======================================================================================
 * 
 * 1. SUBMISSION (Actor: Donor / Giver)
 *    - Donor applies to donate blood at a specific Hospital or Blood Bank.
 *    - Common donor details (bloodgroup, phone, email, DOB) are retrieved directly
 *      from the referenced User schema (u_id) to eliminate redundancy.
 *    - Initial Status: 'NOT_VERIFIED'
 * 
 * 2. CREDENTIAL VERIFICATION (Actor: Admin)
 *    - Platform Admin verifies donor credentials/eligibility.
 *    - Admin changes status:
 *        - 'VERIFIED' / 'PENDING' -> Request becomes visible on Hospital/BloodBank dashboard.
 *        - 'REJECTED' -> If verification fails.
 *    - Records: admin_id, verified_at, verification_notes.
 * 
 * 3. ACCEPTANCE & APPOINTMENT SCHEDULING (Actor: Hospital / Blood Bank)
 *    - Hospital/BloodBank reviews verified request on their dashboard and accepts it.
 *    - Status changes to: 'ACCEPTED'
 *    - Hospital schedules the appointment:
 *        - Records: appointment_date, appointment_time, appointment_venue.
 * 
 * 4. DONATION COMPLETION & INVENTORY INTEGRATION (Actor: Hospital / Staff)
 *    - Donor visits and completes donation.
 *    - Hospital/Staff changes status to: 'COMPLETED'
 *    - A new entry is created in BloodBag model and referenced here:
 *        - Records: bag_id (ref: 'BloodBag'), staff_id, completed_at.
 * =======================================================================================
 */

export const GIVER_REQUEST_STATUSES = [
  'NOT_VERIFIED', // Initial state upon donor submission
  'VERIFIED',     // Admin verified donor credentials
  'PENDING',      // Awaiting hospital review on dashboard
  'ACCEPTED',     // Hospital accepted & scheduled appointment
  'COMPLETED',    // Donation completed & blood bag created
  'REJECTED',     // Rejected by Admin or Hospital
  'CANCELLED',    // Cancelled by donor
];

export const TARGET_INSTITUTION_TYPES = ['HOSPITAL', 'BLOOD_BANK'];

export const giverRequestSchema = new Schema(
  {
    // --- 1. DONOR REFERENCE ---
    // Note: Personal info (bloodgroup, phone, email, DOB, pincode) is fetched
    // directly from the referenced User document via populate('u_id').
    u_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor user reference (u_id) is required'],
      index: true,
    },

    // --- 2. TARGET RECIPIENT INSTITUTION ---
    target_type: {
      type: String,
      enum: TARGET_INSTITUTION_TYPES,
      default: 'HOSPITAL',
      index: true,
    },
    hospital_id: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
      index: true,
    },
    bloodbank_id: {
      type: Schema.Types.ObjectId,
      ref: 'BloodBank',
      default: null,
      index: true,
    },

    // Optional request-specific remarks or medical note provided by donor
    donor_notes: {
      type: String,
      trim: true,
      default: null,
    },
    preferred_date: {
      type: Date,
      default: null,
    },

    // --- 3. LIFECYCLE STATUS ---
    status: {
      type: String,
      enum: GIVER_REQUEST_STATUSES,
      default: 'NOT_VERIFIED',
      index: true,
    },

    // --- 4. ADMIN VERIFICATION STAGE ---
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
      index: true,
    },
    verified_at: {
      type: Date,
      default: null,
    },
    verification_notes: {
      type: String,
      trim: true,
      default: null,
    },

    // --- 5. HOSPITAL ACCEPTANCE & APPOINTMENT SCHEDULING ---
    accepted_at: {
      type: Date,
      default: null,
    },
    appointment_date: {
      type: Date,
      default: null,
      index: true,
    },
    appointment_time: {
      type: String,
      trim: true,
      default: null, // e.g., "10:30 AM" or "14:00"
    },
    appointment_venue: {
      type: String,
      trim: true,
      default: null, // e.g., "Room 204, Blood Donation Wing"
    },
    scheduling_notes: {
      type: String,
      trim: true,
      default: null,
    },

    // --- 6. DONATION COMPLETION & BLOODBAG CREATION ---
    completed_at: {
      type: Date,
      default: null,
    },
    bag_id: {
      type: Schema.Types.ObjectId,
      ref: 'BloodBag',
      default: null,
      index: true,
    },
    staff_id: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
      index: true,
    },

    // --- 7. REJECTION / CANCELLATION DETAILS ---
    rejection_reason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual getters to access donor details directly from populated u_id without redundant DB fields
giverRequestSchema.virtual('bloodgroup').get(function () {
  return this.u_id?.bloodgroup;
});

giverRequestSchema.virtual('phone').get(function () {
  return this.u_id?.phone;
});

giverRequestSchema.virtual('email').get(function () {
  return this.u_id?.email;
});

// Virtual ID aliases for convenience
giverRequestSchema.virtual('requestId').get(function () {
  return this._id;
});

giverRequestSchema.virtual('donorId').get(function () {
  return this.u_id?._id || this.u_id;
});

giverRequestSchema.virtual('hospitalId').get(function () {
  return this.hospital_id?._id || this.hospital_id;
});

giverRequestSchema.virtual('bloodBankId').get(function () {
  return this.bloodbank_id?._id || this.bloodbank_id;
});

giverRequestSchema.virtual('bloodBagId').get(function () {
  return this.bag_id?._id || this.bag_id;
});

export const GiverRequestSchema = giverRequestSchema;
export const GiverRequest = mongoose.models.GiverRequest || mongoose.model('GiverRequest', giverRequestSchema);
export default GiverRequest;
