import mongoose from 'mongoose';

const { Schema } = mongoose;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const REQUEST_STATUSES = ['PENDING', 'APPROVED', 'ALLOCATED', 'FULFILLED', 'REJECTED', 'CANCELLED'];

export const requestSchema = new Schema(
  {
    u_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference (u_id) is required'],
      index: true,
    },
    bloodgroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: BLOOD_GROUPS,
      index: true,
    },
    weight: {
      type: Number,
      required: [true, 'Required blood weight/volume is required'],
      min: [1, 'Weight requested must be at least 1'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      index: true,
    },
    date_of_request: {
      type: Date,
      required: [true, 'Date of request is required'],
      default: Date.now,
      index: true,
    },
    date_of_requirement: {
      type: Date,
      required: [true, 'Date of requirement is required'],
      index: true,
    },
    A_id: {
      type: Schema.Types.ObjectId,
      ref: 'Allotment',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'PENDING',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: req_id
requestSchema.virtual('req_id').get(function () {
  return this._id;
});

export const RequestSchema = requestSchema;
export const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
export default Request;
