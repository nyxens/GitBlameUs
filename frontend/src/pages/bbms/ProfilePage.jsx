import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  Droplet,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Copy,
  QrCode,
  ShieldCheck,
  Activity,
  Heart,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CustomDropdown } from '@ui';
import { updateUserProfile } from '../../services/authService.js';
import { getMyGiverRequests } from '../../services/giverService.js';
import { getMyQrPayload } from '../../services/qrService.js';
import QRCode from 'qrcode';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other / Prefer not to say' },
];

const ABO_COMPATIBILITY = {
  'O-': {
    rh: 'Rh Negative (Rh-)',
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    special: 'Universal Red Cell Donor',
    antigenCode: 'Rh(D)- / Kell-',
  },
  'O+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
    special: 'High Regional Demand',
    antigenCode: 'Rh(D)+ / Kell-',
  },
  'A-': {
    rh: 'Rh Negative (Rh-)',
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
    special: 'Rare Blood Group',
    antigenCode: 'Rh(D)- / A-Ag',
  },
  'A+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    special: 'High Platelet Demand',
    antigenCode: 'Rh(D)+ / A-Ag',
  },
  'B-': {
    rh: 'Rh Negative (Rh-)',
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
    special: 'Critical Reserve Group',
    antigenCode: 'Rh(D)- / B-Ag',
  },
  'B+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    special: 'Active Emergency Group',
    antigenCode: 'Rh(D)+ / B-Ag',
  },
  'AB-': {
    rh: 'Rh Negative (Rh-)',
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    special: 'Universal Plasma Donor',
    antigenCode: 'Rh(D)- / AB-Ag',
  },
  'AB+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    special: 'Universal Recipient',
    antigenCode: 'Rh(D)+ / AB-Ag',
  },
};

// Generates an authentic formatted donor registration code
function getDonorRegistrationCode(id) {
  const raw = String(id || 'LV-99214488').replace(/[^a-zA-Z0-9]/g, '');
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash + raw.charCodeAt(i)) >>> 0;
  }
  const hashStr = String(hash).padStart(12, '849201948271');
  return `LV-${hashStr.slice(0, 4)}-${hashStr.slice(4, 8)}-${hashStr.slice(8, 12)}`;
}

// Real, signed QR code for this account (resolves to the member's details for organization scanners)
const UserQRCode = () => {
  const [src, setSrc] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyQrPayload()
      .then((payload) => QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 360 }))
      .then((url) => { if (!cancelled) setSrc(url); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  if (failed) return <span className="text-[11px] text-neutral-500 text-center px-2">QR code unavailable for this account.</span>;
  if (!src) return <span className="text-[11px] text-neutral-500">Generating…</span>;
  return <img src={src} alt="Your LifeVault QR code" className="w-full h-full" />;
};

export const ProfilePage = ({ user, onUpdateUser }) => {
  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || user?.username || '',
    phone: user?.phone || '',
    bloodgroup: user?.bloodgroup || user?.bloodGroup || 'O+',
    gender: user?.gender || 'MALE',
    pincode: user?.pincode || '10001',
    DOB: user?.DOB ? new Date(user.DOB).toISOString().split('T')[0] : '2000-01-01',
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
    emergencyContactRelation: user?.emergencyContactRelation || '',
    medicalConditions: user?.medicalConditions || '',
    donationPrecautions: user?.donationPrecautions || '',
    isAvailableForDonation: user?.isAvailableForDonation !== undefined ? user.isAvailableForDonation : true,
    privacyShowOnRegistry: user?.privacyShowOnRegistry !== undefined ? user.privacyShowOnRegistry : true,
    privacyAllowNearbyContact: user?.privacyAllowNearbyContact !== undefined ? user.privacyAllowNearbyContact : true,
    privacyMaskPhone: user?.privacyMaskPhone !== undefined ? user.privacyMaskPhone : false,
    password: '',
    confirmPassword: '',
  });

  const [donations, setDonations] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Synchronize state when user prop changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || user.username || prev.name,
        phone: user.phone || prev.phone,
        bloodgroup: user.bloodgroup || user.bloodGroup || prev.bloodgroup,
        gender: user.gender || prev.gender,
        pincode: user.pincode || prev.pincode,
        DOB: user.DOB ? new Date(user.DOB).toISOString().split('T')[0] : prev.DOB,
        emergencyContactName: user.emergencyContactName !== undefined ? user.emergencyContactName : prev.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone !== undefined ? user.emergencyContactPhone : prev.emergencyContactPhone,
        emergencyContactRelation: user.emergencyContactRelation !== undefined ? user.emergencyContactRelation : prev.emergencyContactRelation,
        medicalConditions: user.medicalConditions !== undefined ? user.medicalConditions : prev.medicalConditions,
        donationPrecautions: user.donationPrecautions !== undefined ? user.donationPrecautions : prev.donationPrecautions,
        isAvailableForDonation: user.isAvailableForDonation !== undefined ? user.isAvailableForDonation : prev.isAvailableForDonation,
        privacyShowOnRegistry: user.privacyShowOnRegistry !== undefined ? user.privacyShowOnRegistry : prev.privacyShowOnRegistry,
        privacyAllowNearbyContact: user.privacyAllowNearbyContact !== undefined ? user.privacyAllowNearbyContact : prev.privacyAllowNearbyContact,
        privacyMaskPhone: user.privacyMaskPhone !== undefined ? user.privacyMaskPhone : prev.privacyMaskPhone,
      }));

      // Fetch verified donation records
      async function loadDonationHistory() {
        try {
          const userId = user.id || user._id || user.sub;
          const res = await getMyGiverRequests(userId);
          if (res?.success && Array.isArray(res.data)) {
            const completed = res.data.filter((r) => r.status === 'COMPLETED');
            setDonations(completed);
          }
        } catch {
          // Keep empty list
        }
      }

      loadDonationHistory();
    }
  }, [user]);

  // Profile completion score calculation
  const profileCompletion = useMemo(() => {
    const checks = [
      { field: formData.name, weight: 15, label: 'Full Legal Name' },
      { field: formData.phone, weight: 15, label: 'Phone Number' },
      { field: formData.bloodgroup, weight: 15, label: 'Blood Group' },
      { field: formData.gender, weight: 10, label: 'Gender' },
      { field: formData.DOB, weight: 10, label: 'Date of Birth' },
      { field: formData.pincode, weight: 10, label: 'Postal Code' },
      { field: formData.emergencyContactPhone, weight: 15, label: 'Emergency Contact' },
      { field: formData.medicalConditions, weight: 10, label: 'Medical History' },
    ];

    let score = 0;
    const missing = [];
    checks.forEach((item) => {
      if (item.field && String(item.field).trim().length > 0) {
        score += item.weight;
      } else {
        missing.push(item.label);
      }
    });

    return { score, missing };
  }, [formData]);

  const donorCode = useMemo(() => {
    return getDonorRegistrationCode(user?.id || user?._id || 'LV-99214488');
  }, [user?.id, user?._id]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(donorCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReset = () => {
    if (!user) return;
    setFormData({
      name: user.name || user.username || '',
      phone: user.phone || '',
      bloodgroup: user.bloodgroup || user.bloodGroup || 'O+',
      gender: user.gender || 'MALE',
      pincode: user.pincode || '10001',
      DOB: user.DOB ? new Date(user.DOB).toISOString().split('T')[0] : '2000-01-01',
      emergencyContactName: user.emergencyContactName || '',
      emergencyContactPhone: user.emergencyContactPhone || '',
      emergencyContactRelation: user.emergencyContactRelation || '',
      medicalConditions: user.medicalConditions || '',
      donationPrecautions: user.donationPrecautions || '',
      isAvailableForDonation: user.isAvailableForDonation !== undefined ? user.isAvailableForDonation : true,
      privacyShowOnRegistry: user.privacyShowOnRegistry !== undefined ? user.privacyShowOnRegistry : true,
      privacyAllowNearbyContact: user.privacyAllowNearbyContact !== undefined ? user.privacyAllowNearbyContact : true,
      privacyMaskPhone: user.privacyMaskPhone !== undefined ? user.privacyMaskPhone : false,
      password: '',
      confirmPassword: '',
    });
    setErrorMsg('');
    setSuccessMsg('Changes discarded.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password && formData.password.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bloodgroup: formData.bloodgroup,
        gender: formData.gender,
        pincode: formData.pincode.trim(),
        DOB: formData.DOB,
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: formData.emergencyContactPhone.trim(),
        emergencyContactRelation: formData.emergencyContactRelation.trim(),
        medicalConditions: formData.medicalConditions.trim(),
        donationPrecautions: formData.donationPrecautions.trim(),
        isAvailableForDonation: formData.isAvailableForDonation,
        privacyShowOnRegistry: formData.privacyShowOnRegistry,
        privacyAllowNearbyContact: formData.privacyAllowNearbyContact,
        privacyMaskPhone: formData.privacyMaskPhone,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateUserProfile(payload);
      if (res?.success) {
        setSuccessMsg('Profile updated successfully.');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

        const updatedUser = {
          ...user,
          ...payload,
          ...(res.user || {}),
        };

        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
      } else {
        setErrorMsg(res?.error || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const compatInfo = ABO_COMPATIBILITY[formData.bloodgroup] || ABO_COMPATIBILITY['O+'];

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Profile & Clinical Account</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your verified medical profile, blood compatibility, and regional emergency preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md">
            <span className="text-xs text-neutral-400 font-mono">Blood Group:</span>
            <span className="text-xs font-bold text-white font-mono">{formData.bloodgroup}</span>
          </div>
          <div className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs font-mono text-neutral-400 uppercase">
            {user?.role || 'Citizen'}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mt-6 p-3.5 bg-neutral-900 border border-emerald-500/40 text-emerald-400 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 p-3.5 bg-neutral-900 border border-red-500/40 text-red-400 text-xs rounded-md flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Spacious 2-Column Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Settings & Form Fields (8 Columns) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="divide-y divide-neutral-800">
            {/* Section 1: Basic Profile Information */}
            <section className="py-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Profile Information</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Your legal identity and primary contact channels on the LifeVault network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Registered Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'user@example.com'}
                    className="w-full px-3.5 py-2.5 bg-neutral-900/60 border border-neutral-800/80 rounded-md text-xs text-neutral-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Postal Area / Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Clinical Data */}
            <section className="py-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Clinical & Physiological Attributes</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Standard medical information required for donor eligibility and emergency cross-matching.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <CustomDropdown
                    label="Blood Group"
                    value={formData.bloodgroup}
                    onChange={(val) => handleInputChange('bloodgroup', val)}
                    options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
                    placeholder="Select group"
                    accentColor="purple"
                    gridCols={4}
                    icon={Droplet}
                    rounded="rounded-md"
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Biological Gender"
                    value={formData.gender}
                    onChange={(val) => handleInputChange('gender', val)}
                    options={GENDERS}
                    placeholder="Select gender"
                    accentColor="purple"
                    icon={User}
                    rounded="rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.DOB}
                    onChange={(e) => handleInputChange('DOB', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Known Medical Conditions & Allergies</label>
                  <textarea
                    rows={3}
                    value={formData.medicalConditions}
                    onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                    placeholder="State any cardiovascular conditions, allergies, or active diagnoses..."
                    className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 leading-relaxed transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Medication & Intake Precautions</label>
                  <textarea
                    rows={3}
                    value={formData.donationPrecautions}
                    onChange={(e) => handleInputChange('donationPrecautions', e.target.value)}
                    placeholder="List recent medications (e.g. blood thinners, antibiotics)..."
                    className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 leading-relaxed transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Section 3: Emergency Contact */}
            <section className="py-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Emergency Contact Protocol</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Designated emergency contact contacted by medical personnel if adverse symptoms occur.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Relationship</label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    placeholder="e.g. Spouse, Parent"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Privacy & Visibility Preferences */}
            <section className="py-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Privacy & Registry Preferences</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Configure your availability for regional urgent shortages and public directory queries.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-md cursor-pointer hover:border-neutral-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isAvailableForDonation}
                    onChange={(e) => handleInputChange('isAvailableForDonation', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Active Emergency Donor Availability
                    </span>
                    <span className="text-xs text-neutral-400 block mt-0.5">
                      Allows authorized hospital facilities to request emergency donations during regional shortages.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-md cursor-pointer hover:border-neutral-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.privacyShowOnRegistry}
                    onChange={(e) => handleInputChange('privacyShowOnRegistry', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Public Blood Registry Indexing
                    </span>
                    <span className="text-xs text-neutral-400 block mt-0.5">
                      Appear in local donor searches by postal area without exposing private medical notes.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-md cursor-pointer hover:border-neutral-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.privacyMaskPhone}
                    onChange={(e) => handleInputChange('privacyMaskPhone', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-purple-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-white block">
                      Mask Phone Number in Public Queries
                    </span>
                    <span className="text-xs text-neutral-400 block mt-0.5">
                      Hides digits until an authorized clinical staff member verifies a requisition.
                    </span>
                  </div>
                </label>
              </div>
            </section>

            {/* Section 5: Password Credentials */}
            <section className="py-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Account Password</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Update your authentication password (leave blank to keep your current credentials).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-md text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="py-6 flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                All changes save directly to your central clinical profile.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-md transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Digital Donor ID Card, Profile Completion & Clinical Sidebar (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. Digital Donor ID Card with QR Integration */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-semibold text-white tracking-wider uppercase">
                  Digital Donor ID
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono font-bold text-white">
                {formData.bloodgroup}
              </span>
            </div>

            {/* Card Information Header */}
            <div>
              <span className="text-xs text-neutral-400 block font-mono">Verified Cardholder</span>
              <span className="text-sm font-bold text-white block mt-0.5 truncate">
                {formData.name || 'Anonymous Donor'}
              </span>
              <span className="text-xs text-neutral-500 font-mono block mt-0.5">
                Role: {user?.role || 'Citizen Donor'}
              </span>
            </div>

            {/* Integrated Vector QR Code Box */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-md flex flex-col items-center">
              <div className="w-36 h-36 p-2 bg-white rounded-md flex items-center justify-center">
                <UserQRCode />
              </div>
              <span className="text-xs text-neutral-400 font-mono mt-2 text-center">
                Scan at any LifeVault organization to verify your profile
              </span>
            </div>

            {/* Registration Code Display + Copy Button */}
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-md flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs text-neutral-400 font-mono block">Registry Code</span>
                <span className="text-xs font-mono font-semibold text-white block truncate">
                  {donorCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Copy Registry Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 2. Profile Completion Progress Widget */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">Profile Completion</span>
              </div>
              <span className="text-xs font-bold font-mono text-purple-400">
                {profileCompletion.score}%
              </span>
            </div>

            {/* Flat Solid Progress Bar (No Gradients) */}
            <div className="w-full h-2 rounded bg-neutral-900 border border-neutral-800 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${profileCompletion.score}%` }}
              />
            </div>

            {profileCompletion.missing.length === 0 ? (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                <Check className="w-3.5 h-3.5" />
                <span>All essential credentials verified</span>
              </div>
            ) : (
              <div className="pt-1 space-y-1.5">
                <span className="text-xs text-neutral-400 block">Complete to verify status:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profileCompletion.missing.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-mono"
                    >
                      + {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. ABO/Rh Compatibility Quick Reference */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">ABO / Rh Compatibility</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">{compatInfo.antigenCode}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-neutral-400 block mb-1">Compatible Recipients:</span>
                <div className="flex flex-wrap gap-1">
                  {compatInfo.canDonateTo.map((group) => (
                    <span
                      key={group}
                      className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-xs font-semibold"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1">Compatible Donors:</span>
                <div className="flex flex-wrap gap-1">
                  {compatInfo.canReceiveFrom.map((group) => (
                    <span
                      key={group}
                      className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-white font-mono text-xs font-semibold"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1 border-t border-neutral-800 text-xs text-neutral-400">
                <span className="text-purple-300 font-medium block">{compatInfo.special}</span>
              </div>
            </div>
          </div>

          {/* 4. Verified Donations Ledger Snapshot */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-white">Donation Ledger</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {donations.length} {donations.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            {donations.length === 0 ? (
              <p className="text-xs text-neutral-500 py-1 leading-relaxed">
                No certified donation records found. Completed hospital intakes will automatically appear here.
              </p>
            ) : (
              <div className="divide-y divide-neutral-800 max-h-48 overflow-y-auto">
                {donations.map((item, idx) => (
                  <div key={item._id || idx} className="py-2 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-white block font-medium truncate max-w-[160px]">
                        {item.hospital_id?.hos_name || item.hospital_name || 'LifeVault Center'}
                      </span>
                      <span className="text-neutral-400 block font-mono">
                        {item.completed_at
                          ? new Date(item.completed_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })
                          : 'Certified Date'}
                      </span>
                    </div>
                    <span className="text-purple-300 font-mono font-semibold">
                      {(item.units || 1) * 450} ml
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
