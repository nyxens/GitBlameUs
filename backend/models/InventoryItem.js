export const InventoryItemSchema = {
  id: String,
  unitBarcode: String,
  bloodGroup: String,
  component: String,
  volumeMl: Number,
  collectionDate: Date,
  expirationDate: Date,
  storageLockerId: String,
  storageTemperature: Number,
  status: String,
};
