import User, { UserSchema } from './User.js';
import Donor, { DonorSchema } from './Donor.js';
import Patient, { PatientSchema } from './Patient.js';
import Hospital, { HospitalSchema } from './Hospital.js';
import BloodBank, { BloodBankSchema } from './BloodBank.js';
import InventoryItem, { InventoryItemSchema, BloodUnit } from './InventoryItem.js';
import Requisition, { RequisitionSchema, BloodRequest } from './Requisition.js';
import Appointment, { AppointmentSchema } from './Appointment.js';
import DonationDrive, { DonationDriveSchema } from './DonationDrive.js';
import LabScreening, { LabScreeningSchema } from './LabScreening.js';

export {
  User,
  UserSchema,
  Donor,
  DonorSchema,
  Patient,
  PatientSchema,
  Hospital,
  HospitalSchema,
  BloodBank,
  BloodBankSchema,
  InventoryItem,
  InventoryItemSchema,
  BloodUnit,
  Requisition,
  RequisitionSchema,
  BloodRequest,
  Appointment,
  AppointmentSchema,
  DonationDrive,
  DonationDriveSchema,
  LabScreening,
  LabScreeningSchema,
};

export default {
  User,
  Donor,
  Patient,
  Hospital,
  BloodBank,
  InventoryItem,
  BloodUnit,
  Requisition,
  BloodRequest,
  Appointment,
  DonationDrive,
  LabScreening,
};
