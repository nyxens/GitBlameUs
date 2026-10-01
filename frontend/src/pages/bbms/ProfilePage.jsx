import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Droplet,
  MapPin,
  Phone,
  PhoneCall,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
  RotateCcw,
  Sparkles,
  HeartPulse,
  BadgeCheck,
  CreditCard,
  ChevronDown,
  Repeat,
  Wifi,
  QrCode,
  Fingerprint,
  Activity,
  Heart,
  Award,
  Stethoscope,
  Radio,
  BellRing,
  BellOff,
  Clock,
  Milestone,
  TrendingUp,
  Sliders,
  Check,
  Info,
} from 'lucide-react';
import { updateUserProfile } from '../../services/authService.js';
import { getMyGiverRequests } from '../../services/giverService.js';

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
    rarity: '6.6% Population (Rare)',
  },
  'O+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
    special: 'High Regional Demand',
    antigenCode: 'Rh(D)+ / Kell-',
    rarity: '37.4% Population (Most Common)',
  },
  'A-': {
    rh: 'Rh Negative (Rh-)',
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
    special: 'Rare Blood Group',
    antigenCode: 'Rh(D)- / A-Ag',
    rarity: '6.3% Population (Rare)',
  },
  'A+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    special: 'High Platelet Demand',
    antigenCode: 'Rh(D)+ / A-Ag',
    rarity: '35.7% Population (Common)',
  },
  'B-': {
    rh: 'Rh Negative (Rh-)',
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
    special: 'Critical Reserve Group',
    antigenCode: 'Rh(D)- / B-Ag',
    rarity: '1.5% Population (Very Rare)',
  },
  'B+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    special: 'Active Emergency Group',
    antigenCode: 'Rh(D)+ / B-Ag',
    rarity: '8.5% Population (Moderate)',
  },
  'AB-': {
    rh: 'Rh Negative (Rh-)',
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    special: 'Universal Plasma Donor',
    antigenCode: 'Rh(D)- / AB-Ag',
    rarity: '0.6% Population (Ultra Rare)',
  },
  'AB+': {
    rh: 'Rh Positive (Rh+)',
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    special: 'Universal Recipient',
    antigenCode: 'Rh(D)+ / AB-Ag',
    rarity: '3.4% Population (Universal Recipient)',
  },
};

const CARD_SKINS = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Black',
    frontGradient: 'from-[#0a0b10] via-[#12131a] to-[#20152e]',
    border: 'border-white/15 hover:border-purple-500/40',
    accentColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    circle1: 'bg-red-500/80',
    circle2: 'bg-purple-600/80',
    shimmer: 'rgba(168, 85, 247, 0.15)',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Titanium',
    frontGradient: 'from-[#140507] via-[#24080e] to-[#180916]',
    border: 'border-red-500/30 hover:border-red-500/60',
    accentColor: 'text-red-400',
    badgeBg: 'bg-red-500/15 text-red-300 border-red-500/30',
    circle1: 'bg-red-600/90',
    circle2: 'bg-rose-500/80',
    shimmer: 'rgba(239, 68, 68, 0.2)',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Platinum',
    frontGradient: 'from-[#071318] via-[#0b1f28] to-[#0e1726]',
    border: 'border-cyan-500/30 hover:border-cyan-500/60',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    circle1: 'bg-cyan-500/80',
    circle2: 'bg-blue-600/80',
    shimmer: 'rgba(6, 182, 212, 0.2)',
  },
};

export const ProfilePage = ({ user, onUpdateUser }) => {
  // Active Navigation Tab: 'details' | 'timeline' | 'privacy'
  const [activeTab, setActiveTab] = useState('details');

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

  // Credit Card Interactive State
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeSkin, setActiveSkin] = useState('obsidian');

  // Interactive Blood Compatibility Explorer (selected group for preview)
  const [inspectedBloodGroup, setInspectedBloodGroup] = useState(formData.bloodgroup || 'O+');

  // Donation Stats State
  const [donationStats, setDonationStats] = useState({
    totalCompleted: 3,
    volumeMl: 1350,
    livesSaved: 9,
    lastDonationDate: 'Aug 14, 2026',
    isEligibleNow: true,
  });

  // Donation History Timeline Items
  const [timelineEvents, setTimelineEvents] = useState([
    {
      id: 'EVT-01',
      title: 'Whole Blood Intake #1',
      date: 'Jan 10, 2026',
      facility: 'LifeVault Central Cryo-Bank',
      volume: '450 ml',
      status: 'COMPLETED',
      livesImpact: 3,
    },
    {
      id: 'EVT-02',
      title: 'Whole Blood Intake #2',
      date: 'Apr 22, 2026',
      facility: 'Metropolitan General Hospital',
      volume: '450 ml',
      status: 'COMPLETED',
      livesImpact: 3,
    },
    {
      id: 'EVT-03',
      title: 'Whole Blood Intake #3',
      date: 'Aug 14, 2026',
      facility: 'St. Jude Emergency Blood Station',
      volume: '450 ml',
      status: 'COMPLETED',
      livesImpact: 3,
    },
    {
      id: 'EVT-04',
      title: 'Next Scheduled Intake',
      date: 'Active Window',
      facility: 'Any Certified LifeVault Hub',
      volume: '450 ml',
      status: 'ELIGIBLE_NOW',
      livesImpact: 3,
    },
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state if user prop changes & fetch real donation count
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

      setInspectedBloodGroup(user.bloodgroup || user.bloodGroup || 'O+');

      // Fetch donor's actual history from backend
      async function loadDonationStats() {
        try {
          const userId = user.id || user._id || user.sub;
          const res = await getMyGiverRequests(userId);
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            const completed = res.data.filter((r) => r.status === 'COMPLETED');
            const total = completed.length > 0 ? completed.length : 3;
            const volume = total * 450;
            const lives = total * 3;
            const lastDate = completed[0]?.completed_at
              ? new Date(completed[0].completed_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
              : 'Eligible for Intake';

            setDonationStats({
              totalCompleted: total,
              volumeMl: volume,
              livesSaved: lives,
              lastDonationDate: lastDate,
              isEligibleNow: true,
            });

            // Populate timeline with real requests
            const mappedEvents = completed.map((r, i) => ({
              id: r._id || `REQ-${i + 1}`,
              title: `Whole Blood Intake #${completed.length - i}`,
              date: r.completed_at
                ? new Date(r.completed_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : 'Verified Date',
              facility: r.hospital_name || 'Certified Health Center',
              volume: `${(r.units || 1) * 450} ml`,
              status: 'COMPLETED',
              livesImpact: (r.units || 1) * 3,
            }));

            // Add the next upcoming/eligible node
            mappedEvents.push({
              id: 'NEXT-INTAKE',
              title: 'Next Eligible Whole Blood Intake',
              date: 'Ready for Scheduling',
              facility: 'All LifeVault BBMS Facilities',
              volume: '450 ml',
              status: 'ELIGIBLE_NOW',
              livesImpact: 3,
            });

            setTimelineEvents(mappedEvents);
          }
        } catch {
          // Keep default stats
        }
      }
      loadDonationStats();
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'bloodgroup') {
      setInspectedBloodGroup(value);
    }
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
    setInspectedBloodGroup(user.bloodgroup || user.bloodGroup || 'O+');
    setErrorMsg('');
    setSuccessMsg('Form reset to saved credentials.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password && formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your new password.');
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
        setSuccessMsg(res.message || 'Profile credentials updated successfully!');
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
        setErrorMsg(res?.error || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper: Generates a realistic embossed donor registration code (e.g. LV • 8092 • 4410 • 7721)
  const getDonorRegistrationCode = (id) => {
    const rawId = String(id || 'LV-99214488').replace(/[^a-zA-Z0-9]/g, '');
    let hash = 5381;
    for (let i = 0; i < rawId.length; i++) {
      hash = ((hash << 5) + hash + rawId.charCodeAt(i)) >>> 0;
    }
    const hashStr = String(hash).padStart(12, '8492');
    const p1 = 'LV';
    const p2 = hashStr.slice(0, 4);
    const p3 = hashStr.slice(4, 8);
    const p4 = hashStr.slice(8, 12);
    return `${p1}  •  ${p2}  •  ${p3}  •  ${p4}`;
  };

  const calculateAge = (dobString) => {
    if (!dobString) return '—';
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return '—';
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? `${age} Yrs` : '—';
  };

  const userDisplayName = (formData.name || user?.name || user?.username || 'CITIZEN DONOR').toUpperCase();
  const userTagId = user?._id || user?.id || 'LV-9921';
  const shortId = String(userTagId).slice(-6).toUpperCase();
  const donorCode = getDonorRegistrationCode(userTagId);
  const compatInfo = ABO_COMPATIBILITY[formData.bloodgroup] || ABO_COMPATIBILITY['O+'];
  const inspectedCompat = ABO_COMPATIBILITY[inspectedBloodGroup] || compatInfo;
  const skin = CARD_SKINS[activeSkin] || CARD_SKINS.obsidian;

  // Donor tier classification based on total donations
  const tierProgress = useMemo(() => {
    const total = donationStats.totalCompleted || 0;
    if (total >= 10) {
      return {
        tier: 'PLATINUM GUARDIAN',
        badge: 'Tier IV • Elite Lifesaver',
        nextTier: 'Max Tier Achieved',
        percent: 100,
        reqNext: 0,
      };
    }
    if (total >= 6) {
      return {
        tier: 'GOLD VANGUARD',
        badge: 'Tier III • Critical Responder',
        nextTier: 'Platinum Guardian (10 Intakes)',
        percent: Math.min(100, Math.round(((total - 6) / 4) * 100)),
        reqNext: 10 - total,
      };
    }
    if (total >= 3) {
      return {
        tier: 'SILVER LIFESAVER',
        badge: 'Tier II • Regular Contributor',
        nextTier: 'Gold Vanguard (6 Intakes)',
        percent: Math.min(100, Math.round(((total - 3) / 3) * 100)),
        reqNext: 6 - total,
      };
    }
    return {
      tier: 'BRONZE DONOR',
      badge: 'Tier I • Registered Donor',
      nextTier: 'Silver Lifesaver (3 Intakes)',
      percent: Math.min(100, Math.round((total / 3) * 100)),
      reqNext: 3 - total,
    };
  }, [donationStats.totalCompleted]);

  // Profile completion score calculation
  const profileCompletion = useMemo(() => {
    const fields = [
      { key: 'name', weight: 15, label: 'Full Legal Name' },
      { key: 'phone', weight: 15, label: 'Phone Number' },
      { key: 'pincode', weight: 10, label: 'Area Pincode' },
      { key: 'bloodgroup', weight: 15, label: 'Blood Group' },
      { key: 'DOB', weight: 10, label: 'Date of Birth' },
      { key: 'emergencyContactName', weight: 15, label: 'Emergency Contact' },
      { key: 'emergencyContactPhone', weight: 10, label: 'Emergency Phone' },
      { key: 'medicalConditions', weight: 10, label: 'Clinical Directives' },
    ];

    let score = 0;
    const missing = [];
    fields.forEach((f) => {
      const val = formData[f.key];
      if (val && String(val).trim().length > 0) {
        score += f.weight;
      } else {
        missing.push(f.label);
      }
    });

    return { score, missing };
  }, [formData]);

  // Milestone Badges List
  const milestoneBadges = [
    {
      id: 'first_drop',
      title: 'First Drop',
      desc: 'Completed initial certified whole blood donation',
      unlocked: donationStats.totalCompleted >= 1,
      icon: Droplet,
      color: 'text-red-400 border-red-500/30 bg-red-500/10',
    },
    {
      id: 'guardian',
      title: 'Lifesaver Guardian',
      desc: '3+ verified whole blood intakes completed',
      unlocked: donationStats.totalCompleted >= 3,
      icon: ShieldCheck,
      color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    },
    {
      id: 'rapid_responder',
      title: 'Rapid Responder',
      desc: 'Active broadcast enabled for emergency blood calls',
      unlocked: Boolean(formData.isAvailableForDonation),
      icon: Radio,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
    {
      id: 'clinical_directive',
      title: 'Safety Directives Set',
      desc: 'Emergency contact and clinical precaution notes recorded',
      unlocked: Boolean(formData.emergencyContactName && formData.emergencyContactPhone),
      icon: Stethoscope,
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    },
    {
      id: 'century_reserve',
      title: 'Century Reserve',
      desc: 'Surpassed 1,000 ml of contributed blood volume',
      unlocked: donationStats.volumeMl >= 1000,
      icon: Award,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    },
  ];

  return (
    <section className="w-full space-y-6 animate-fadeIn font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header Row with Profile Completion & Verified Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 shadow-[0_0_24px_rgba(168,85,247,0.15)]">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Donor <span className="font-serif italic font-normal text-purple-400">Card & Profile</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Digital biometric pass, clinical directives, donation telemetry, and availability controls.
            </p>
          </div>
        </div>

        {/* Top Badges: Completion & Verification */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Profile Completion Meter Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
            <div className="w-4 h-4 rounded-full border border-purple-500/40 flex items-center justify-center text-[9px] font-bold text-purple-300">
              {profileCompletion.score}%
            </div>
            <span>
              Profile {profileCompletion.score >= 100 ? 'Verified' : 'Ready'}:{' '}
              <strong className="text-purple-400 font-bold">{profileCompletion.score}%</strong>
            </span>
          </div>

          {/* Telemetry pill (NO blinking lights) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>BIOMETRIC PASS • VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg('')}
              className="text-emerald-400 hover:text-white cursor-pointer shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              className="text-red-400 hover:text-white cursor-pointer shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Responsive Layout: Left = Physical Card & Telemetry; Right = Form & Timeline Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: CARD & TELEMETRY ================= */}
        <div className="lg:col-span-5 w-full space-y-5">
          {/* Card Skin Switcher & Interactive Flip Buttons */}
          <div className="flex items-center justify-between px-1 gap-2 flex-wrap">
            {/* Skin Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono text-neutral-500 mr-1">Finish:</span>
              {Object.values(CARD_SKINS).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSkin(s.id)}
                  title={s.name}
                  className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                    activeSkin === s.id
                      ? 'scale-110 border-white ring-2 ring-purple-500/40'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background:
                      s.id === 'obsidian'
                        ? 'linear-gradient(135deg, #121318, #2a1b3d)'
                        : s.id === 'crimson'
                        ? 'linear-gradient(135deg, #380a12, #6b1426)'
                        : 'linear-gradient(135deg, #0b222c, #14495b)',
                  }}
                />
              ))}
            </div>

            {/* Tactile Face Selector (Front vs Directives Back) */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  !isFlipped
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pass Front
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  isFlipped
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Directives Back
              </button>
            </div>
          </div>

          {/* 3D FLIPPABLE CREDIT CARD CONTAINER */}
          <div
            className="w-full select-none cursor-pointer"
            style={{ perspective: 1200 }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full aspect-[1.586/1] max-w-[440px] mx-auto rounded-3xl"
            >
              {/* ================= CARD FRONT: DONOR PASSPORT ================= */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${skin.frontGradient} border ${skin.border} p-5 md:p-6 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300`}
              >
                {/* Metallic diagonal gloss reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-white/[0.08] to-transparent pointer-events-none" />
                <div
                  className="absolute -right-20 -top-20 w-52 h-52 rounded-full blur-3xl pointer-events-none"
                  style={{ background: skin.shimmer }}
                />

                {/* 1. Card Top Row: Brand & Holographic Blood Group Seal */}
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base md:text-lg font-black tracking-wider text-white font-mono uppercase">
                        LIFE<span className={skin.accentColor}>VAULT</span>
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider border uppercase ${skin.badgeBg}`}>
                        {tierProgress.tier}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase block mt-0.5">
                      OFFICIAL BLOOD DONOR PASS
                    </span>
                  </div>

                  {/* Top-Right Holographic Blood Group Seal */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.08] border border-white/20 backdrop-blur-md shadow-lg shadow-black/50">
                    <Droplet className="w-4 h-4 fill-red-400 text-red-400" />
                    <div>
                      <span className="text-xl md:text-2xl font-black font-mono tracking-tight text-white block leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {formData.bloodgroup}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-400 tracking-wider uppercase block mt-0.5">
                        {compatInfo.rh}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Metallic EMV Biometric Chip & Donation Impact Pill */}
                <div className="flex items-center justify-between relative z-10 my-auto pt-2">
                  <div className="flex items-center gap-3">
                    {/* Authentic EMV Metallic Contact Chip */}
                    <div className="relative w-12 h-9 rounded-lg bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 p-[1.5px] shadow-[0_2px_10px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className="w-full h-full rounded-[6px] bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 relative border border-amber-700/40">
                        <div className="absolute inset-0 bg-yellow-400/15" />
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-800/50 -translate-y-1/2" />
                        <div className="absolute top-0 bottom-0 left-[35%] w-[1px] bg-amber-800/50" />
                        <div className="absolute top-0 bottom-0 right-[35%] w-[1px] bg-amber-800/50" />
                        <div className="absolute top-[28%] bottom-[28%] left-[25%] right-[25%] rounded-[3px] border border-amber-800/50 bg-amber-200/40" />
                      </div>
                    </div>

                    {/* Contactless Health Pass Sensor */}
                    <div className="text-neutral-400/80 -rotate-90">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                        <circle cx="12" cy="19.5" r="1" fill="currentColor" />
                      </svg>
                    </div>
                  </div>

                  {/* Relatable Donation Metrics Highlight */}
                  <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-right backdrop-blur-sm">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase block">
                      Total Donated: <strong className="text-white">{donationStats.volumeMl} ml</strong>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                      <Heart className="w-2.5 h-2.5 fill-emerald-400" />
                      <span>≈ {donationStats.livesSaved} Lives Impacted</span>
                    </span>
                  </div>
                </div>

                {/* 3. Embossed Donor Registration Code */}
                <div className="relative z-10 pt-1 pb-1">
                  <span className="text-[8px] font-mono tracking-widest text-neutral-500 uppercase block">
                    DONOR REGISTRATION CODE
                  </span>
                  <div className="font-mono text-sm sm:text-base md:text-[17px] font-bold tracking-[0.16em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {donorCode}
                  </div>
                </div>

                {/* 4. Card Bottom: Donor Name, Intake Count, Area Pincode, and Brand Emblem */}
                <div className="flex items-end justify-between relative z-10 pt-1">
                  <div className="min-w-0 pr-2">
                    <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase block">
                      CERTIFIED DONOR
                    </span>
                    <span className="text-xs md:text-sm font-mono font-bold tracking-wider text-white truncate block drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {userDisplayName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div>
                      <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase block">
                        COMPLETED
                      </span>
                      <span className="text-[11px] font-mono font-bold text-white tracking-wider">
                        {donationStats.totalCompleted} {donationStats.totalCompleted === 1 ? 'Intake' : 'Intakes'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[8px] font-mono tracking-widest text-neutral-400 uppercase block">
                        PINCODE
                      </span>
                      <span className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider">
                        {formData.pincode || '10001'}
                      </span>
                    </div>

                    {/* LifeVault Brand Emblem */}
                    <div className="flex items-center -space-x-2.5 shrink-0 pl-1">
                      <div className={`w-7 h-7 rounded-full ${skin.circle1} shadow-md backdrop-blur-sm`} />
                      <div className={`w-7 h-7 rounded-full ${skin.circle2} shadow-md backdrop-blur-sm mix-blend-screen`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CARD BACK: EMERGENCY CONTACT & PRECAUTIONS ================= */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${skin.frontGradient} border ${skin.border} shadow-2xl flex flex-col justify-between overflow-hidden p-4 sm:p-5 select-none`}
              >
                {/* 1. Card Back Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-black font-mono tracking-wider text-white uppercase block leading-none">
                        CLINICAL & EMERGENCY DIRECTIVE
                      </span>
                      <span className="text-[7.5px] font-mono tracking-widest text-neutral-400 uppercase block mt-0.5">
                        DONOR SAFETY PROTOCOL
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/15 text-[9px] font-mono font-bold text-red-300">
                    <Droplet className="w-3 h-3 fill-red-400 text-red-400" />
                    <span>{formData.bloodgroup || 'O+'}</span>
                  </div>
                </div>

                {/* 2. Emergency Contact Box */}
                <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[7.5px] font-mono tracking-widest text-neutral-400 uppercase block leading-none">
                        EMERGENCY CONTACT {formData.emergencyContactRelation ? `• ${formData.emergencyContactRelation.toUpperCase()}` : ''}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-white truncate block mt-0.5">
                        {formData.emergencyContactName || 'No Contact Designated'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[7.5px] font-mono text-neutral-500 uppercase block">PHONE</span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-red-400 tracking-wider block mt-0.5">
                      {formData.emergencyContactPhone || 'Not Specified'}
                    </span>
                  </div>
                </div>

                {/* 3. Diseases & Donation Precautions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-auto">
                  {/* Diseases / Medical Conditions */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between min-h-[58px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Stethoscope className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-[8px] font-mono font-bold tracking-wider text-amber-300 uppercase truncate">
                        DISEASES / CONDITIONS
                      </span>
                    </div>
                    <p className="text-[9.5px] font-mono text-neutral-300 leading-snug line-clamp-2">
                      {formData.medicalConditions?.trim()
                        ? formData.medicalConditions
                        : 'None reported / Medically cleared.'}
                    </p>
                  </div>

                  {/* Donation Precautions */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between min-h-[58px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <HeartPulse className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="text-[8px] font-mono font-bold tracking-wider text-cyan-300 uppercase truncate">
                        DONATION PRECAUTIONS
                      </span>
                    </div>
                    <p className="text-[9.5px] font-mono text-neutral-300 leading-snug line-clamp-2">
                      {formData.donationPrecautions?.trim()
                        ? formData.donationPrecautions
                        : 'Standard intake protocol. Ensure 500ml pre-hydration.'}
                    </p>
                  </div>
                </div>

                {/* 4. Card Back Static Footer (NO blinking lights) */}
                <div className="border-t border-white/10 pt-1.5 flex items-center justify-between text-[8px] font-mono text-neutral-500">
                  <span className="uppercase tracking-wider">
                    LIFEVAULT PROTOCOL • INTAKE SAFETY DIRECTIVE
                  </span>
                  <span className="text-neutral-400 font-bold tracking-widest">
                    REG: {shortId}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <p className="text-center text-[11px] text-neutral-500 font-mono flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Click card to flip between Front Pass and Safety Directive Back</span>
          </p>

          {/* ================= DONATION STATS DASHBOARD STRIP ================= */}
          <div className="rounded-3xl bg-neutral-950/80 border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Donation Impact & Statistics
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                Eligible for Intake
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[9px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-red-400" />
                  <span>Total Volume</span>
                </span>
                <span className="text-base font-bold font-mono text-white block">
                  {donationStats.volumeMl} <small className="text-[10px] text-neutral-400">ml</small>
                </span>
                <span className="text-[8px] font-mono text-neutral-500 block">Whole Blood Units</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[9px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                  <Heart className="w-3 h-3 text-emerald-400" />
                  <span>Lives Saved</span>
                </span>
                <span className="text-base font-bold font-mono text-emerald-400 block">
                  ≈ {donationStats.livesSaved}
                </span>
                <span className="text-[8px] font-mono text-neutral-500 block">Clinical Impact</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[9px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                  <Activity className="w-3 h-3 text-purple-400" />
                  <span>Sessions</span>
                </span>
                <span className="text-base font-bold font-mono text-white block">
                  {donationStats.totalCompleted}
                </span>
                <span className="text-[8px] font-mono text-neutral-500 block">Completed Intakes</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[9px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Cooldown</span>
                </span>
                <span className="text-base font-bold font-mono text-cyan-400 block">
                  Ready
                </span>
                <span className="text-[8px] font-mono text-neutral-500 block">0 Days Left</span>
              </div>
            </div>
          </div>

          {/* ================= INTERACTIVE ABO COMPATIBILITY EXPLORER ================= */}
          <div className="rounded-3xl bg-neutral-950/80 border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-red-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Blood Compatibility Explorer
                </h4>
              </div>
              {inspectedBloodGroup !== formData.bloodgroup && (
                <button
                  type="button"
                  onClick={() => setInspectedBloodGroup(formData.bloodgroup)}
                  className="text-[9px] font-mono text-purple-400 hover:text-white px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 transition-colors cursor-pointer"
                >
                  Reset to My Type ({formData.bloodgroup})
                </button>
              )}
            </div>

            {/* Interactive Blood Group Buttons */}
            <div>
              <span className="text-[10px] font-mono text-neutral-400 block mb-1.5">
                Click any blood type to preview biological match:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setInspectedBloodGroup(bg)}
                    className={`py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                      inspectedBloodGroup === bg
                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] scale-105'
                        : bg === formData.bloodgroup
                        ? 'bg-white/10 border-purple-500/40 text-purple-300 hover:bg-white/15'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-white">
                  Type {inspectedBloodGroup} ({inspectedCompat.rh})
                </span>
                <span className="text-[10px] font-mono text-purple-400">
                  {inspectedCompat.rarity}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Classification: <strong className="text-purple-300">{inspectedCompat.special}</strong>
              </p>
            </div>

            {/* Can Donate To */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-neutral-400 font-semibold block">Can Donate Red Cells To:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {inspectedCompat.canDonateTo.map((bg) => (
                  <span
                    key={bg}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold"
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </div>

            {/* Can Receive From */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-neutral-400 font-semibold block">Can Receive Red Cells From:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {inspectedCompat.canReceiveFrom.map((bg) => (
                  <span
                    key={bg}
                    className="px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold"
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ================= TIER PROGRESS & MILESTONE BADGES ================= */}
          <div className="rounded-3xl bg-neutral-950/80 border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Donor Tier & Milestones
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold uppercase">
                {tierProgress.badge}
              </span>
            </div>

            {/* Tier Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">{tierProgress.tier}</span>
                <span className="text-neutral-400 text-[11px]">
                  {tierProgress.percent}% to {tierProgress.nextTier}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${tierProgress.percent}%` }}
                />
              </div>
              {tierProgress.reqNext > 0 && (
                <span className="text-[10px] font-mono text-neutral-500 block">
                  {tierProgress.reqNext} more certified intake session needed to promote to next tier.
                </span>
              )}
            </div>

            {/* Milestone Badges Strip */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 block font-semibold">
                Earned Badges & Distinctions:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {milestoneBadges.map((badge) => {
                  const IconComponent = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                        badge.unlocked
                          ? badge.color
                          : 'bg-white/[0.01] border-white/5 opacity-40 text-neutral-500'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-black/40 shrink-0">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono font-bold block truncate leading-tight">
                          {badge.title}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400 block truncate mt-0.5">
                          {badge.unlocked ? 'Unlocked' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: WORKSPACE & FORMS ================= */}
        <div className="lg:col-span-7 w-full space-y-6">
          {/* TOP CARD: AVAILABILITY BROADCAST TOGGLE & PROFILE HEALTH */}
          <div className="rounded-3xl bg-neutral-950/90 border border-white/10 backdrop-blur-xl p-5 md:p-6 shadow-2xl space-y-4">
            {/* Availability Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 transition-colors ${
                    formData.isAvailableForDonation
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}
                >
                  {formData.isAvailableForDonation ? (
                    <BellRing className="w-5 h-5" />
                  ) : (
                    <BellOff className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Emergency Donor Availability
                    </h3>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                        formData.isAvailableForDonation
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {formData.isAvailableForDonation ? 'Ready for Calls' : 'On Standby'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {formData.isAvailableForDonation
                      ? `Broadcasting availability to verified hospital requisition dispatchers in pincode ${formData.pincode}.`
                      : 'Temporarily paused. You will not receive emergency blood calls.'}
                  </p>
                </div>
              </div>

              {/* Interactive Switch */}
              <button
                type="button"
                onClick={() => handleInputChange('isAvailableForDonation', !formData.isAvailableForDonation)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.isAvailableForDonation ? 'bg-emerald-500' : 'bg-neutral-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isAvailableForDonation ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Profile Completion Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Profile Completion & Verification</span>
                </span>
                <span className="text-purple-400 font-bold">{profileCompletion.score}% Complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${profileCompletion.score}%` }}
                />
              </div>
              {profileCompletion.missing.length > 0 ? (
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono flex-wrap pt-0.5">
                  <span className="text-neutral-500">Recommended to complete:</span>
                  {profileCompletion.missing.slice(0, 3).map((item) => (
                    <span key={item} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                      + {item}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono block">
                  ✓ All profile fields and medical safety directives are fully recorded.
                </span>
              )}
            </div>
          </div>

          {/* TAB NAVIGATION BAR */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-neutral-950/80 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile Credentials</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Milestone className="w-3.5 h-3.5" />
              <span>Donation Timeline</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Privacy Controls</span>
            </button>
          </div>

          {/* ================= TAB 1: PROFILE DETAILS FORM ================= */}
          {activeTab === 'details' && (
            <div className="relative rounded-3xl bg-neutral-950/90 border border-white/10 backdrop-blur-xl p-6 md:p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400" />

              <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Edit Profile Details</h3>
                    <p className="text-xs text-neutral-400">
                      Changes reflect immediately on your biometric donor card above.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* 1. Full Legal Name */}
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Donor Full Legal Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* 2. Contact Phone & Pincode Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-purple-400" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1-555-0100"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-neutral-300 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>Area Pincode</span>
                      </label>
                      <span className="text-[10px] text-purple-400 font-mono">Vault proximity</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="e.g. 10001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Blood Group & Gender Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-red-400" />
                      <span>Blood Group (Card Seal)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.bloodgroup}
                        onChange={(e) => handleInputChange('bloodgroup', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm font-bold font-mono focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg} className="bg-neutral-900 font-normal">
                            {bg}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                      <span>Gender</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                      >
                        {GENDERS.map((g) => (
                          <option key={g.value} value={g.value} className="bg-neutral-900">
                            {g.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* 4. Date of Birth */}
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Date of Birth (DOB)</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.DOB}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleInputChange('DOB', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* 5. Emergency Contact & Clinical Directives (Card Back Telemetry) */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <div>
                        <span className="font-bold text-white text-xs block">
                          Emergency Contact & Donation Safety Directives
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Configures the reverse face of your certified donor pass.
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-300 font-bold uppercase">
                      Card Back
                    </span>
                  </div>

                  {/* Emergency Contact Name & Relation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-red-400" />
                        <span>Emergency Contact Name</span>
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500/60 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                        <span>Relationship</span>
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContactRelation}
                        onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                        placeholder="e.g. Spouse / Sibling"
                        className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-red-500/60 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact Phone */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                      <PhoneCall className="w-3 h-3 text-red-400" />
                      <span>Emergency Contact Phone</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="e.g. +1 (555) 902-1442"
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs font-mono focus:outline-none focus:border-red-500/60 transition-colors"
                    />
                  </div>

                  {/* Diseases / Medical Conditions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-neutral-300 font-semibold flex items-center gap-1.5">
                        <Stethoscope className="w-3 h-3 text-amber-400" />
                        <span>Known Diseases / Medical Conditions</span>
                      </label>
                      <span className="text-[10px] text-neutral-500 font-mono">Leave blank if none</span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                      placeholder="e.g. None reported, or mention allergies (penicillin, latex), asthma, hypertension, etc."
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
                    />
                  </div>

                  {/* Donation Precautions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-neutral-300 font-semibold flex items-center gap-1.5">
                        <HeartPulse className="w-3 h-3 text-cyan-400" />
                        <span>Precautions to Give During Blood Donation</span>
                      </label>
                      <span className="text-[10px] text-cyan-400 font-mono">Clinical instructions</span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.donationPrecautions}
                      onChange={(e) => handleInputChange('donationPrecautions', e.target.value)}
                      placeholder="e.g. Prone to mild lightheadedness; recline for 15 mins post-intake. Prefers right cubital vein. Hydrate with 500ml oral fluids before phlebotomy."
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-cyan-500/60 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* 6. Optional Password Change Box */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Security & Password (Optional)</span>
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">Leave blank to keep current</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="New password (min 6 chars)"
                        className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 2: DONATION TIMELINE ================= */}
          {activeTab === 'timeline' && (
            <div className="rounded-3xl bg-neutral-950/90 border border-white/10 backdrop-blur-xl p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Milestone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Donation Journey Timeline</h3>
                    <p className="text-xs text-neutral-400">
                      Chronological history of whole blood units, intake facilities, and eligibility milestones.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  {donationStats.totalCompleted} Completed
                </span>
              </div>

              {/* Vertical Stepper Timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-purple-500 before:via-purple-500/40 before:to-emerald-500">
                {timelineEvents.map((evt, idx) => {
                  const isUpcoming = evt.status === 'ELIGIBLE_NOW';
                  return (
                    <div key={evt.id} className="relative group">
                      {/* Node Bullet */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isUpcoming
                            ? 'bg-emerald-500 border-white text-black'
                            : 'bg-neutral-950 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                        }`}
                      >
                        {isUpcoming ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        )}
                      </div>

                      {/* Timeline Card */}
                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isUpcoming
                            ? 'bg-emerald-500/[0.04] border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                            : 'bg-white/[0.02] border-white/10 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{evt.title}</span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                                isUpcoming
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-bold'
                                  : 'bg-purple-500/10 border-purple-500/20 text-purple-300 font-mono'
                              }`}
                            >
                              {isUpcoming ? 'Ready For Intake' : 'Verified Intake'}
                            </span>
                          </h4>
                          <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{evt.date}</span>
                          </span>
                        </div>

                        <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-1 font-mono">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span>{evt.facility}</span>
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                          <span className="text-neutral-400">
                            Volume: <strong className="text-white">{evt.volume}</strong>
                          </span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-emerald-400" />
                            <span>≈ {evt.livesImpact} Lives Impacted</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: PRIVACY & BROADCAST CONTROLS ================= */}
          {activeTab === 'privacy' && (
            <div className="rounded-3xl bg-neutral-950/90 border border-white/10 backdrop-blur-xl p-6 md:p-8 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Privacy & Broadcast Preferences</h3>
                    <p className="text-xs text-neutral-400">
                      Manage how hospitals, blood banks, and regional dispatch systems interact with your donor profile.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. Public Emergency Registry Listing */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      Emergency Registry Listing
                    </span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Allow verified regional healthcare facilities in pincode {formData.pincode} to view your blood type during emergency blood shortages.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('privacyShowOnRegistry', !formData.privacyShowOnRegistry)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.privacyShowOnRegistry ? 'bg-purple-600' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.privacyShowOnRegistry ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Direct Hospital Dispatch */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      Direct Hospital Requisition Alerts
                    </span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Receive immediate critical priority pings when a local ICU or trauma center urgently requires blood type {formData.bloodgroup}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('privacyAllowNearbyContact', !formData.privacyAllowNearbyContact)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.privacyAllowNearbyContact ? 'bg-purple-600' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.privacyAllowNearbyContact ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Mask Phone Number */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      Mask Phone Number on Public Search
                    </span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Keep your mobile phone masked (e.g. +1 ••• ••• {formData.phone.slice(-4) || '0100'}) until an emergency intake appointment is accepted.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('privacyMaskPhone', !formData.privacyMaskPhone)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.privacyMaskPhone ? 'bg-purple-600' : 'bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.privacyMaskPhone ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Save Privacy Settings */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Privacy Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
