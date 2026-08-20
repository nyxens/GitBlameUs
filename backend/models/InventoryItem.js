import mongoose from 'mongoose';

export const inventoryItemSchema = new mongoose.Schema(
  {
    unitBarcode: {
      type: String,
      required: [true, 'Unit barcode is required'],
      unique: true,
      trim: true,
      index: true,
    },
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodBank',
      index: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      index: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      index: true,
    },
    component: {
      type: String,
      required: [true, 'Component is required'],
      enum: ['WHOLE_BLOOD', 'PRBC', 'RBC', 'PLATELETS', 'FFP', 'PLASMA', 'CRYO'],
      default: 'WHOLE_BLOOD',
      index: true,
    },
    volumeMl: {
      type: Number,
      required: [true, 'Volume in ml is required'],
      min: [50, 'Volume must be at least 50ml'],
      max: [600, 'Volume cannot exceed 600ml'],
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
    storageLockerId: {
      type: String,
      trim: true,
    },
    storageTemperature: {
      type: Number,
    },
    temperatureStatus: {
      type: String,
      enum: ['OPTIMAL', 'WARNING', 'BREACH'],
      default: 'OPTIMAL',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'DISPATCHED', 'EXPIRED', 'DISCARDED', 'TRANSFUSED'],
      default: 'AVAILABLE',
      index: true,
    },
    labScreeningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabScreening',
    },
    reservedForRequisitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requisition',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for lightning-fast FEFO matching and allocation queries
inventoryItemSchema.index({ bloodGroup: 1, component: 1, status: 1, expirationDate: 1 });

export const InventoryItemSchema = inventoryItemSchema;
export const InventoryItem = mongoose.models.InventoryItem || mongoose.model('InventoryItem', inventoryItemSchema);
export const BloodUnit = InventoryItem;
export default InventoryItem;
