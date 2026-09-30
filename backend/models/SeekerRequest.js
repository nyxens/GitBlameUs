import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * =======================================================================================
 * SEEKER / RECIPIENT BLOOD REQUEST WORKFLOW
 * =======================================================================================
 * 
 * 1. SUBMISSION (Actor: Seeker / Patient / Hospital Citizen)
 *    - Seeker applies to receive blood units from a specific Hospital or Blood Bank.
 *    - Captures patient name, required blood group, units needed, emergency flag,
 *      preferred/required date, clinical notes, and area pincode.
 *    - Initial Status: 'NOT_VERIFIED'
 * 
 * 2. CREDENTIAL & MEDICAL VERIFICATION (Actor: Admin)
 *    - BBMS Admin verifies prescription / medical necessity / seeker eligibility.
 *    - Admin transitions status:
 *        - 'VERIFIED' / 'PENDING' -> Request becomes actionable on Hospital/BloodBank dashboard.
 *        - 'REJECTED' -> If verification fails.
 *    - Records: admin_id, verified_at, verification_notes.
 * 
 * 3. ACCEPTANCE & ALLOCATION / SCHEDULING (Actor: Hospital / Blood Bank)
 *    - Hospital/BloodBank reviews verified seeker request and accepts it.
 *    - Status changes to: 'ACCEPTED'
 *    - Hospital schedules the dispatch / pickup appointment:
 *        - Records: schedule_date, schedule_time, pickup_venue, scheduling_notes.
 * 
 * 4. FULFILLMENT & INVENTORY DISPATCH (Actor: Hospital / Staff)
 *    - Blood bags are allocated and handed over or dispatched.
 *    - Status changes to: 'COMPLETED'
 *    - Records: completed_at, staff_id, allocated_bags, allotment_id.
 * =======================================================================================
 */

export const SEEKER_REQUEST_STATUSES = [
  'NOT_VERIFIED', // Initial state upon seeker submission
  'VERIFIED',     // Admin verified medical necessity & credentials
  'PENDING',      // Awaiting hospital/blood bank review on dashboard
  'ACCEPTED',     // Hospital accepted & scheduled pickup/dispatch
  'COMPLETED',    // Fulfilled / Blood units dispatched
  'REJECTED',     // Rejected by Admin or Hospital
  'CANCELLED',    // Cancelled by seeker
];

export const TARGET_INSTITUTION_TYPES = ['HOSPITAL', 'BLOOD_BANK'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const seekerRequestSchema = new Schema(
  {
    // --- 1. SEEKER REFERENCE ---
    u_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seeker user reference (u_id) is required'],
      index: true,
    },

    // Patient or seeker details
    patient_name: {
      type: String,
      trim: true,
      default: null,
    },
    bloodgroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required'],
      index: true,
    },
    units: {
      type: Number,
      required: [true, 'Units needed is required'],
      min: [1, 'At least 1 unit must be requested'],
      default: 1,
    },
    weight: {
      type: Number,
      default: 450, // default 450 ml per unit
    },
    is_emergency: {
      type: Boolean,
      default: false,
      index: true,
    },
    pincode: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    required_date: {
      type: Date,
      default: null,
      index: true,
    },
    seeker_notes: {
      type: String,
      trim: true,
      default: null,
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

    // --- 3. LIFECYCLE STATUS ---
    status: {
      type: String,
      enum: SEEKER_REQUEST_STATUSES,
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

    // --- 5. HOSPITAL ACCEPTANCE & SCHEDULING ---
    accepted_at: {
      type: Date,
      default: null,
    },
    schedule_date: {
      type: Date,
      default: null,
      index: true,
    },
    schedule_time: {
      type: String,
      trim: true,
      default: null, // e.g. "10:30 AM"
    },
    pickup_venue: {
      type: String,
      trim: true,
      default: null, // e.g. "Trauma Center Counter 3"
    },
    scheduling_notes: {
      type: String,
      trim: true,
      default: null,
    },

    // --- 6. ALLOCATION & DISPATCH COMPLETION ---
    completed_at: {
      type: Date,
      default: null,
    },
    staff_id: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
      index: true,
    },
    allocated_bags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BloodBag',
      },
    ],
    allotment_id: {
      type: Schema.Types.ObjectId,
      ref: 'Allotment',
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

// Virtual getters to access seeker user details
seekerRequestSchema.virtual('phone').get(function () {
  return this.u_id?.phone;
});

seekerRequestSchema.virtual('email').get(function () {
  return this.u_id?.email;
});

seekerRequestSchema.virtual('displayName').get(function () {
  return this.patient_name || this.u_id?.name || this.u_id?.username || 'Patient Seeker';
});

// Virtual ID aliases for convenience
seekerRequestSchema.virtual('requestId').get(function () {
  return this._id;
});

seekerRequestSchema.virtual('seekerId').get(function () {
  return this.u_id?._id || this.u_id;
});

seekerRequestSchema.virtual('hospitalId').get(function () {
  return this.hospital_id?._id || this.hospital_id;
});

seekerRequestSchema.virtual('bloodBankId').get(function () {
  return this.bloodbank_id?._id || this.bloodbank_id;
});

export const SeekerRequestSchema = seekerRequestSchema;
export const SeekerRequest = mongoose.models.SeekerRequest || mongoose.model('SeekerRequest', seekerRequestSchema);
export default SeekerRequest;
