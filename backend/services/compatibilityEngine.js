/**
 * ABO/Rh Transfusion Compatibility Matrix Engine
 * Enforces zero-error clinical transfusion rules.
 */

const ABO_COMPATIBILITY_MATRIX = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
};

export class CompatibilityEngine {
  static isCompatible(donorType, recipientType) {
    const validDonors = ABO_COMPATIBILITY_MATRIX[recipientType];
    return validDonors ? validDonors.includes(donorType) : false;
  }

  static getCompatibleDonors(recipientType) {
    return ABO_COMPATIBILITY_MATRIX[recipientType] || [];
  }
}
