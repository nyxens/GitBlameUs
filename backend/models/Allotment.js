import mongoose from 'mongoose';

const { Schema } = mongoose;

export const allotmentSchema = new Schema(
  {
    req_id: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
      required: [true, 'Request reference (req_id) is required'],
      index: true,
    },
    bag_id: {
      type: Schema.Types.ObjectId,
      ref: 'BloodBag',
      required: [true, 'BloodBag reference (bag_id) is required'],
      unique: true,
      index: true,
    },
    s_id: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Authorizing Staff reference (s_id) is required'],
      index: true,
    },
    date_of_allocation: {
      type: Date,
      required: [true, 'Date of allocation is required'],
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: a_id
allotmentSchema.virtual('a_id').get(function () {
  return this._id;
});

export const AllotmentSchema = allotmentSchema;
export const Allotment = mongoose.models.Allotment || mongoose.model('Allotment', allotmentSchema);
export default Allotment;
