import mongoose from 'mongoose';

export const inventoryItemSchema = new mongoose.Schema(
  {
    unitBarcode: {
      type: String,
      required: [true, 'Unit barcode is required'],
      unique: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    component: {
      type: String,
      required: [true, 'Component is required'],
      enum: ['WHOLE_BLOOD', 'RBC', 'PLATELETS', 'PLASMA', 'CRYO'],
      default: 'WHOLE_BLOOD',
    },
    volumeMl: {
      type: Number,
      required: [true, 'Volume in ml is required'],
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    storageLockerId: {
      type: String,
      trim: true,
    },
    storageTemperature: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'DISPATCHED', 'EXPIRED', 'DISCARDED'],
      default: 'AVAILABLE',
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryItemSchema = inventoryItemSchema;
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
export default InventoryItem;

