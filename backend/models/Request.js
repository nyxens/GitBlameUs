import mongoose from 'mongoose';

const { Schema } = mongoose;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const TARGET_INSTITUTION_TYPES = ['HOSPITAL', 'BLOOD_BANK'];

export const REQUEST_STATUSES = [
  'NOT_VERIFIED', // Initial citizen seeker application awaiting admin review
  'VERIFIED',     // Admin verified medical necessity / doctor prescription
  'PENDING',      // Active in hospital/blood bank triage queue
  'ACCEPTED',     // Hospital/Blood bank accepted & scheduled
  'ALLOCATED',    // Blood bag matched & reserved from cryogenic inventory
  'COMPLETED',    // Fulfilled / Blood units dispatched to patient
  'REJECTED',     // Rejected by Admin or Hospital
  'CANCELLED',    // Cancelled by requester
  // Legacy aliases for backward compatibility:
  'APPROVED',     // Alias for VERIFIED
  'FULFILLED',    // Alias for COMPLETED
];

export const requestSchema = new Schema(
  {
    // --- 1. Requester & Patient Reference ---
    u_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference (u_id) is required'],
      index: true,
    },
    patient_name: {
      type: String,
      trim: true,
      default: null,
    },
    request_type: {
      type: String,
      enum: ['CITIZEN', 'HOSPITAL'],
      default: 'CITIZEN',
      index: true,
    },

    // --- 2. Blood Specifications ---
    bloodgroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: BLOOD_GROUPS,
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
      default: 450,
      min: [1, 'Weight requested must be at least 1'],
    },
    is_emergency: {
      type: Boolean,
      default: false,
      index: true,
    },

    // --- 3. Location & Timestamps ---
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      index: true,
    },
    date_of_request: {
      type: Date,
      default: Date.now,
      index: true,
    },
    required_date: {
      type: Date,
      default: null,
      index: true,
    },
    date_of_requirement: {
      type: Date,
      default: null,
      index: true,
    },
    seeker_notes: {
      type: String,
      trim: true,
      default: null,
    },

    // --- 4. Target Institution ---
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

    // --- 5. Lifecycle Status ---
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'PENDING',
      index: true,
    },

    // --- 6. Admin Verification Stage ---
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

    // --- 7. Acceptance & Scheduling ---
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
      default: null,
    },
    pickup_venue: {
      type: String,
      trim: true,
      default: null,
    },
    scheduling_notes: {
      type: String,
      trim: true,
      default: null,
    },

    // --- 8. Allocation & Fulfillment ---
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
    A_id: {
      type: Schema.Types.ObjectId,
      ref: 'Allotment',
      default: null,
      index: true,
    },

    // --- 9. Rejection / Cancellation ---
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

// Pre-save synchronization
requestSchema.pre('save', function () {
  // Sync requirement dates
  if (this.required_date && !this.date_of_requirement) {
    this.date_of_requirement = this.required_date;
  } else if (this.date_of_requirement && !this.required_date) {
    this.required_date = this.date_of_requirement;
  }

  // Sync allotment IDs
  if (this.allotment_id && !this.A_id) {
    this.A_id = this.allotment_id;
  } else if (this.A_id && !this.allotment_id) {
    this.allotment_id = this.A_id;
  }

  // Calculate weight from units if not set
  if (this.units && (!this.weight || this.weight === 450)) {
    this.weight = this.units * 450;
  }
});

// Virtuals
requestSchema.virtual('req_id').get(function () {
  return this._id;
});

requestSchema.virtual('requestId').get(function () {
  return this._id;
});

requestSchema.virtual('displayName').get(function () {
  return this.patient_name || this.u_id?.name || this.u_id?.username || 'Patient Requisition';
});

requestSchema.virtual('phone').get(function () {
  return this.u_id?.phone;
});

requestSchema.virtual('email').get(function () {
  return this.u_id?.email;
});

export const RequestSchema = requestSchema;
export const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
export default Request;
