import mongoose from 'mongoose';

const { Schema } = mongoose;

export const inventorySchema = new Schema(
  {
    cellno: {
      type: String,
      required: [true, 'Cell number (cellno) is required'],
      trim: true,
    },
    shelfno: {
      type: String,
      required: [true, 'Shelf number (shelfno) is required'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      index: true,
    },
    hos_or_bank_id: {
      type: Schema.Types.ObjectId,
      required: [true, 'Owning Hospital or BloodBank reference (hos/bank_id) is required'],
      refPath: 'hos_or_bank_type',
      index: true,
    },
    hos_or_bank_type: {
      type: String,
      required: true,
      enum: ['Hospital', 'BloodBank'],
    },
    isfull: {
      type: Boolean,
      default: false,
      index: true,
    },
    capacity: {
      type: Number,
      default: 100,
    },
    current_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for ER diagram primary key naming: I_ID
inventorySchema.virtual('I_ID').get(function () {
  return this._id;
});

export const InventorySchema = inventorySchema;
export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export default Inventory;
