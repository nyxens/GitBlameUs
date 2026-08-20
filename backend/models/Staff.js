import mongoose from 'mongoose';

const { Schema } = mongoose;

export const STAFF_ROLES = ['DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHLEBOTOMIST', 'MANAGER', 'STAFF'];

export const staffSchema = new Schema(
  {
    u_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Linked User account (u_id) is required'],
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: STAFF_ROLES,
      default: 'STAFF',
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Staff department is required'],
      trim: true,
    },
    licence_id: {
      type: String,
      required: [true, 'Staff licence_id is required'],
      unique: true,
      trim: true,
      index: true,
    },
    hos_or_bank_id: {
      type: Schema.Types.ObjectId,
      required: [true, 'Hospital or BloodBank reference (hos_or_bank_id) is required'],
      refPath: 'hos_or_bank_type',
      index: true,
    },
    hos_or_bank_type: {
      type: String,
      required: true,
      enum: ['Hospital', 'BloodBank'],
    },
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: S_Id
staffSchema.virtual('S_Id').get(function () {
  return this._id;
});

export const StaffSchema = staffSchema;
export const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
export default Staff;
