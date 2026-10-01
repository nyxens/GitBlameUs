import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'];

export const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    DOB: {
      type: Date,
      required: [true, 'Date of Birth (DOB) is required'],
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      index: true,
    },
    bloodgroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: BLOOD_GROUPS,
      index: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: GENDERS,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: 'ACTIVE',
    },
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: 'DONOR',
    },
    emergencyContactName: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContactRelation: {
      type: String,
      trim: true,
      default: '',
    },
    medicalConditions: {
      type: String,
      trim: true,
      default: '',
    },
    donationPrecautions: {
      type: String,
      trim: true,
      default: '',
    },
    isAvailableForDonation: {
      type: Boolean,
      default: true,
    },
    privacyShowOnRegistry: {
      type: Boolean,
      default: true,
    },
    privacyAllowNearbyContact: {
      type: Boolean,
      default: true,
    },
    privacyMaskPhone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: u_Id
userSchema.virtual('u_Id').get(function () {
  return this._id;
});

// Backward-compatibility aliases
userSchema.virtual('bloodGroup').get(function () {
  return this.bloodgroup;
});
userSchema.virtual('dob').get(function () {
  return this.DOB;
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const UserSchema = userSchema;
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
