import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'DONOR', 'HOSPITAL', 'STAFF'],
      default: 'DONOR',
    },
    phone: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    hospitalName: {
      type: String,
      trim: true,
    },
    licenseId: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const UserSchema = userSchema;
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

