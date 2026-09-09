import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ShieldCheck,
  Award,
  PlusCircle,
  CheckCircle2,
  Droplet,
  AlertCircle,
  FileText,
  QrCode,
  Search,
  HeartHandshake,
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Send,
  Filter,
  Sparkles,
  Check,
  Info,
  ArrowRight,
} from 'lucide-react';
import { SpotlightCard, AnimatedButton } from '@ui/index';

/**
 * =======================================================================================
 * GIVER / DONOR WORKFLOW IN CITIZEN DASHBOARD
 * =======================================================================================
 * 
 * 1. DONOR SUBMITS GIVER REQUEST (Client Side - Giver Tab)
 *    - Giver provides/confirms their current pincode, contact details (phone, email), and age.
 *    - Nearby certified Hospitals & Blood Banks are displayed based on pincode.
 *    - Giver selects a target Hospital or Blood Bank and clicks "Send Donation Request".
 *    - Initial Status: 'NOT_VERIFIED'
 * 
 * 2. ADMIN CREDENTIAL VERIFICATION (Admin Dashboard)
 *    - Admin inspects donor eligibility, credentials, and health history.
 *    - Admin marks request as 'VERIFIED' (or 'REJECTED' if ineligible).
 *    - Verified request transitions to 'PENDING' for the hospital's review.
 * 
 * 3. HOSPITAL ACCEPTANCE & APPOINTMENT SCHEDULING (Hospital Dashboard)
 *    - Hospital/BloodBank notices the verified donor on their regional dashboard.
 *    - Hospital accepts the request (status -> 'ACCEPTED') and sets an official
 *      appointment date and time slot.
 * 
 * 4. DONATION COMPLETION & BLOODBAG CREATION (Hospital / Staff)
 *    - Donor attends appointment and completes donation.
 *    - Hospital marks status -> 'COMPLETED'.
 *    - System automatically registers a new BloodBag entry in cryogenic inventory.
 * =======================================================================================
 */

// Hardcoded reference dataset of Hospitals and Blood Banks
export const HARDCODED_INSTITUTIONS = [
  {
    id: 'HOS-101',
    name: 'Metropolitan Apex Trauma & Multi-Specialty Hospital',
    type: 'HOSPITAL',
    pincode: '110001',
    city: 'Central District',
    distance: '1.4 km away',
    address: '42 Health Boulevard, Sector 5, Metro City',
    phone: '+91 (011) 2345-6789',
    email: 'bloodbank@apextrauma.org',
    urgentNeeds: ['O-', 'B-', 'Platelets'],
    openHours: '24/7 Trauma Emergency',
    verified: true,
    rating: '4.9 ★',
  },
  {
    id: 'BB-201',
    name: 'Red Cross Regional Cryo Blood Bank & Vault',
    type: 'BLOOD_BANK',
    pincode: '110001',
    city: 'Central District',
    distance: '2.1 km away',
    address: 'Plot 12, LifeLine Complex, Red Cross Avenue',
    phone: '+91 (011) 9876-5432',
    email: 'donations@redcrosscryo.org',
    urgentNeeds: ['ALL GROUPS', 'PRBC', 'FFP Plasma'],
    openHours: '08:00 AM - 09:00 PM',
    verified: true,
    rating: '4.8 ★',
  },
  {
    id: 'HOS-102',
    name: 'St. Jude Memorial Cardiac & Multi-Care Center',
    type: 'HOSPITAL',
    pincode: '110002',
    city: 'North District',
    distance: '3.8 km away',
    address: '88 Compassion Way, North Ridge Enclave',
    phone: '+91 (011) 3456-7890',
    email: 'transfusion@stjudecare.org',
    urgentNeeds: ['A+', 'O+', 'AB-'],
    openHours: '24/7 Emergency Wing',
    verified: true,
    rating: '4.9 ★',
  },
  {
    id: 'BB-202',
    name: 'Rotary Apex Cell Vault & Community Blood Bank',
    type: 'BLOOD_BANK',
    pincode: '110003',
    city: 'South District',
    distance: '4.5 km away',
    address: 'Rotary Enclave, Outer Ring Road Crossway',
    phone: '+91 (011) 4567-8901',
    email: 'contact@rotarybloodvault.org',
    urgentNeeds: ['Whole Blood', 'O- Negative'],
    openHours: '09:00 AM - 08:00 PM',
    verified: true,
    rating: '4.7 ★',
  },
  {
    id: 'HOS-103',
    name: 'City Care Emergency Care & General Hospital',
    type: 'HOSPITAL',
    pincode: '110004',
    city: 'West District',
    distance: '6.2 km away',
    address: 'Block C, Western Express Healthcare Corridor',
    phone: '+91 (011) 5678-9012',
    email: 'desk@citycaregeneral.org',
    urgentNeeds: ['O-', 'A-'],
    openHours: '24/7 Emergency Center',
    verified: true,
    rating: '4.6 ★',
  },
];

export const CitizenPortalPage = ({ user, onOpenFindBlood }) => {
  const [activeTab, setActiveTab] = useState('giver'); // Default to Giver tab as requested
  const [notification, setNotification] = useState(null);

  // Helper to calculate initial age from user's DOB
  const calculateInitialAge = () => {
    if (!user?.DOB) return 24;
    const birth = new Date(user.DOB);
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    const calculated = Math.abs(ageDate.getUTCFullYear() - 1970);
    return isNaN(calculated) || calculated <= 0 ? 24 : calculated;
  };

  // ---------------------------------------------------------------------------
  // GIVER FORM STATE (Editable profile details, pincode, target selection)
  // ---------------------------------------------------------------------------
  const [giverPincode, setGiverPincode] = useState(user?.pincode || '110001');
  const [giverName, setGiverName] = useState(user?.name || 'Alexander Wright');
  const [giverPhone, setGiverPhone] = useState(user?.phone || '+91 98765 43210');
  const [giverEmail, setGiverEmail] = useState(user?.email || 'donor@lifevault.org');
  const [giverAge, setGiverAge] = useState(calculateInitialAge());
  const [giverBloodGroup, setGiverBloodGroup] = useState(user?.bloodGroup || user?.bloodgroup || 'O+');
  const [giverPreferredDate, setGiverPreferredDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [giverNotes, setGiverNotes] = useState('');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('HOS-101');
  const [institutionFilter, setInstitutionFilter] = useState('ALL'); // 'ALL' | 'HOSPITAL' | 'BLOOD_BANK'
  const [isSubmittingGiver, setIsSubmittingGiver] = useState(false);

  // Giver Requests Log (tracks submission and workflow progress)
  const [giverRequests, setGiverRequests] = useState([
    {
      id: 'GIV-1092',
      institutionName: 'Metropolitan Apex Trauma & Multi-Specialty Hospital',
      institutionType: 'HOSPITAL',
      pincode: '110001',
      bloodGroup: user?.bloodGroup || 'O+',
      status: 'NOT_VERIFIED',
      submittedAt: 'Just now',
      appointmentDate: null,
      appointmentTime: null,
    },
  ]);

  // Appointment Form State (Existing Schedule Tab)
  const [appointment, setAppointment] = useState({
    center: 'New York Central Blood Vault',
    date: '2026-08-05',
    slot: '10:00 AM',
    booked: false,
  });

  // Blood Request Form State (Existing Request Blood Tab)
  const [bloodRequest, setBloodRequest] = useState({
    recipientName: user?.name || 'Alexander Wright',
    isGuardian: false,
    bloodGroup: user?.bloodGroup || 'O+',
    units: 2,
    hospitalName: 'St. Jude Emergency Care',
    urgency: 'URGENT_TRAUMA',
    submitted: false,
  });

  // Active Requests Log (Existing Tracker Tab)
  const [userRequests, setUserRequests] = useState([
    {
      id: 'REQ-8821',
      recipient: 'Sarah Jenkins (Self)',
      bloodGroup: 'O-',
      units: 2,
      hospital: 'St. Jude Emergency Center',
      status: 'In Courier Dispatch',
      eta: '12 mins',
      date: 'Today, 14:30',
    },
  ]);

  // Filter institutions by Pincode & Type
  const filteredInstitutions = HARDCODED_INSTITUTIONS.filter((inst) => {
    const matchesType =
      institutionFilter === 'ALL' || inst.type === institutionFilter;
    const matchesPincode =
      !giverPincode.trim() ||
      inst.pincode.startsWith(giverPincode.trim().substring(0, 3));
    return matchesType && matchesPincode;
  });

  const selectedInstitution = HARDCODED_INSTITUTIONS.find(
    (inst) => inst.id === selectedInstitutionId
  );

  // ---------------------------------------------------------------------------
  // GIVER FORM SUBMIT HANDLER (Phase 1: Submit with status 'NOT_VERIFIED')
  // ---------------------------------------------------------------------------
  const handleSendGiverRequest = (e) => {
    e.preventDefault();

    if (!selectedInstitution) {
      setNotification('Please select a Hospital or Blood Bank to send your donation request.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setIsSubmittingGiver(true);

    setTimeout(() => {
      const newGiverReq = {
        id: `GIV-${Math.floor(1000 + Math.random() * 9000)}`,
        institutionName: selectedInstitution.name,
        institutionType: selectedInstitution.type,
        pincode: giverPincode,
        bloodGroup: giverBloodGroup,
        donorName: giverName,
        phone: giverPhone,
        email: giverEmail,
        age: giverAge,
        preferredDate: giverPreferredDate,
        donorNotes: giverNotes,
        status: 'NOT_VERIFIED', // Initial status awaiting Admin verification
        submittedAt: 'Just now',
        appointmentDate: null,
        appointmentTime: null,
      };

      setGiverRequests([newGiverReq, ...giverRequests]);
      setIsSubmittingGiver(false);
      setNotification(
        `Donation request sent to ${selectedInstitution.name}! Status: NOT_VERIFIED (Awaiting Admin verification).`
      );
      setTimeout(() => setNotification(null), 6000);
    }, 600);
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    setAppointment({ ...appointment, booked: true });
    setNotification('Donation Appointment Booked Successfully! Confirmation sent via SMS & Email.');
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    const newReq = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: bloodRequest.recipientName,
      bloodGroup: bloodRequest.bloodGroup,
      units: bloodRequest.units,
      hospital: bloodRequest.hospitalName,
      status: 'Approved & Matching FEFO Vault',
      eta: '15 mins',
      date: 'Just now',
    };
    setUserRequests([newReq, ...userRequests]);
    setBloodRequest({ ...bloodRequest, submitted: true });
    setNotification(`Blood Request ${newReq.id} submitted! Matched against regional reserves.`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24 px-4 sm:px-8 md:px-16 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Welcome Header */}
        <div className="p-6 md:p-8 rounded-3xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500 shadow-lg shadow-red-950/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-2xl">
                  {(user?.name || 'A').charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">{user?.name || 'Alexander Wright'}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
                  {user?.bloodGroup || user?.bloodgroup || 'O+'} Donor
                </span>
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-2">
                <span>Citizen Life-Saver Workspace</span>
                <span>•</span>
                <span className="text-emerald-400">Verified Citizen ID: {user?.id || 'CIT-8021'}</span>
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-neutral-900/90 px-4 py-3 rounded-2xl border border-white/10 text-xs font-mono">
            <div>
              <div className="text-neutral-400 text-[10px]">Total Donations</div>
              <div className="text-lg font-bold text-white">4 Times</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-neutral-400 text-[10px]">Lives Saved</div>
              <div className="text-lg font-bold text-red-400">12 Patients</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-neutral-400 text-[10px]">Eligibility</div>
              <div className="text-lg font-bold text-emerald-400">Eligible Now</div>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center justify-between shadow-xl font-mono"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                <span>{notification}</span>
              </div>
              <span className="text-xs text-red-400 uppercase">UPDATE</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-white/10 mb-8 text-xs font-medium">
          {/* GIVER TAB (Main Requested Feature) */}
          <button
            onClick={() => setActiveTab('giver')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'giver'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-red-300" />
            <span>Giver Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('donor_card')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'donor_card'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Digital Donor Card</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'schedule'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book Donation Slot</span>
          </button>

          <button
            onClick={() => setActiveTab('request_blood')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'request_blood'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Blood Unit</span>
          </button>

          <button
            onClick={() => setActiveTab('my_requests')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'my_requests'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Active Tracker ({userRequests.length})</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* TAB: GIVER PORTAL (Main Requested Form & Hospital/Bank Selection)     */}
        {/* ===================================================================== */}
        {activeTab === 'giver' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Workflow Explainer Header Banner */}
            <div className="p-6 rounded-3xl bg-neutral-950 border border-red-500/30 bg-gradient-to-r from-red-950/40 via-neutral-950 to-neutral-950 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-widest mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Citizen Giver Life-Vault Program</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    Donate Blood to Certified <span className="text-red-400 font-serif italic">Hospitals & Blood Banks</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1.5 max-w-2xl leading-relaxed">
                    Enter your pincode to locate verified hospitals and cryo blood banks in your vicinity. Confirm your contact details and age, then dispatch your voluntary donation offer.
                  </p>
                </div>

                {/* Workflow Stepper Preview */}
                <div className="flex items-center gap-2 text-[10px] font-mono bg-white/5 p-3 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">1</span>
                    <span>Submit</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-500" />
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">2</span>
                    <span>Admin Verify</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-500" />
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">3</span>
                    <span>Hospital Accept</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-neutral-500" />
                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">4</span>
                    <span>BloodBag Added</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSendGiverRequest} className="space-y-8">
              {/* SECTION 1: DONOR CONTACT DETAILS & AGE (Autofilled from DB but Editable) */}
              <div className="p-6 md:p-8 rounded-3xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">1. Donor Information & Location</h4>
                      <p className="text-xs text-neutral-400">
                        Autofilled from your verified profile. Update any fields as needed.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    Profile Linked
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  {/* Pincode Input (Key requirement) */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      <span>Current Pincode</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 110001"
                      value={giverPincode}
                      onChange={(e) => setGiverPincode(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">Filters institutions matching your area.</p>
                  </div>

                  {/* Age (Autofilled & Editable) */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>Age (Years)</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="18"
                      max="65"
                      value={giverAge}
                      onChange={(e) => setGiverAge(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">Eligibility: 18 - 65 years.</p>
                  </div>

                  {/* Blood Group (Autofilled & Editable) */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-red-400" />
                      <span>Blood Group</span>
                    </label>
                    <select
                      value={giverBloodGroup}
                      onChange={(e) => setGiverBloodGroup(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-neutral-500 mt-1">Stored in your certified health record.</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={giverName}
                      onChange={(e) => setGiverName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  {/* Phone (Autofilled & Editable) */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Contact Phone</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={giverPhone}
                      onChange={(e) => setGiverPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  {/* Email (Autofilled & Editable) */}
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={giverEmail}
                      onChange={(e) => setGiverEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white font-mono focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Additional Preferences Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs mt-5 pt-5 border-t border-white/10">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Preferred Donation Date</span>
                    </label>
                    <input
                      type="date"
                      value={giverPreferredDate}
                      onChange={(e) => setGiverPreferredDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5">
                      Medical Notes / Comments (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Preferred morning slot, no recent medications"
                      value={giverNotes}
                      onChange={(e) => setGiverNotes(e.target.value)}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SELECT RECIPIENT INSTITUTION (HOSPITAL OR BLOOD BANK) */}
              <div className="p-6 md:p-8 rounded-3xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">2. Select Hospital or Blood Bank</h4>
                      <p className="text-xs text-neutral-400">
                        Showing verified facilities in or near pincode <span className="text-red-400 font-mono font-bold">{giverPincode || 'All'}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Filter Pill by Type: ALL, HOSPITAL, BLOOD_BANK */}
                  <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setInstitutionFilter('ALL')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        institutionFilter === 'ALL'
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      All ({HARDCODED_INSTITUTIONS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstitutionFilter('HOSPITAL')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        institutionFilter === 'HOSPITAL'
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Hospitals
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstitutionFilter('BLOOD_BANK')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        institutionFilter === 'BLOOD_BANK'
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Blood Banks
                    </button>
                  </div>
                </div>

                {/* Institution Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInstitutions.map((inst) => {
                    const isSelected = selectedInstitutionId === inst.id;
                    const isHospital = inst.type === 'HOSPITAL';

                    return (
                      <div
                        key={inst.id}
                        onClick={() => setSelectedInstitutionId(inst.id)}
                        className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative text-xs select-none ${
                          isSelected
                            ? 'bg-red-950/40 border-red-500 shadow-xl shadow-red-950/50 ring-1 ring-red-500'
                            : 'bg-neutral-900/70 border-white/10 hover:border-white/25 hover:bg-neutral-900'
                        }`}
                      >
                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div>
                          {/* Type & Distance Badges */}
                          <div className="flex items-center gap-2 mb-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                                isHospital
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                              }`}
                            >
                              {isHospital ? 'HOSPITAL' : 'BLOOD BANK'}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {inst.distance}
                            </span>
                          </div>

                          {/* Institution Title */}
                          <h5 className="font-bold text-white text-sm leading-snug mb-2 pr-6">
                            {inst.name}
                          </h5>

                          <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                            {inst.address} • <span className="font-mono text-neutral-300">Pincode: {inst.pincode}</span>
                          </p>
                        </div>

                        {/* Card Details Footer */}
                        <div className="pt-3 border-t border-white/10 space-y-2 text-[11px]">
                          <div className="flex items-center justify-between text-neutral-300">
                            <span className="text-neutral-400">Urgent Requirement:</span>
                            <span className="text-red-400 font-bold font-mono text-[10px]">
                              {inst.urgentNeeds.join(', ')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                            <span>{inst.openHours}</span>
                            <span className="text-amber-400 font-bold">{inst.rating}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInstitutionId(inst.id);
                            }}
                            className={`w-full mt-2 py-2 rounded-xl text-center font-bold text-xs transition-colors ${
                              isSelected
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                            }`}
                          >
                            {isSelected ? 'Selected for Donation' : 'Select Facility'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredInstitutions.length === 0 && (
                  <div className="text-center py-10 text-neutral-400 text-xs">
                    <p className="mb-2">No facilities match the pincode: <strong className="text-white">{giverPincode}</strong></p>
                    <button
                      type="button"
                      onClick={() => setGiverPincode('')}
                      className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
                    >
                      Clear Pincode Filter & Show All Facilities
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION 3: CONFIRMATION & SUBMIT ACTION */}
              <div className="p-6 md:p-8 rounded-3xl bg-neutral-950 border border-red-500/30 bg-gradient-to-br from-red-950/30 via-neutral-950 to-neutral-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
                <div>
                  <div className="text-xs font-mono text-neutral-400 mb-1">Target Destination Selected:</div>
                  <div className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-red-400" />
                    <span>{selectedInstitution ? selectedInstitution.name : 'None Selected'}</span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 flex flex-wrap items-center gap-3">
                    <span>Donor: <strong className="text-white">{giverName}</strong> ({giverAge} yrs)</span>
                    <span>•</span>
                    <span>Blood Group: <strong className="text-red-400 font-mono">{giverBloodGroup}</strong></span>
                    <span>•</span>
                    <span>Pincode: <strong className="text-white font-mono">{giverPincode}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    type="submit"
                    disabled={isSubmittingGiver || !selectedInstitution}
                    className="w-full md:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingGiver ? 'Dispatching Request...' : 'Send Donation Request'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* SECTION 4: ACTIVE GIVER DONATION REQUESTS TRACKER */}
            <div className="pt-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                <span>My Giver Donation Requests ({giverRequests.length})</span>
              </h4>

              <div className="space-y-4">
                {giverRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 rounded-3xl bg-neutral-950/90 border border-white/10 hover:border-white/20 transition-all text-xs font-mono shadow-xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="font-bold text-red-400 text-sm">{req.id}</span>
                          <span className="text-white font-bold text-sm">{req.institutionName}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-[10px]">
                            {req.institutionType}
                          </span>
                        </div>
                        <div className="text-neutral-400 flex flex-wrap items-center gap-3 text-[11px]">
                          <span>Blood Group: <strong className="text-red-400">{req.bloodGroup}</strong></span>
                          <span>•</span>
                          <span>Pincode: {req.pincode}</span>
                          <span>•</span>
                          <span>Submitted: {req.submittedAt}</span>
                        </div>
                      </div>

                      {/* Dynamic Workflow Status Badge & Timeline */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="px-3.5 py-1.5 rounded-xl border bg-amber-950/60 border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span>Status: {req.status} (Awaiting Admin Verification)</span>
                        </div>
                      </div>
                    </div>

                    {/* Step Timeline Indicator */}
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>1. Request Submitted</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <Clock className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                        <span>2. Admin Verification</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <span className="w-4 h-4 rounded-full border border-neutral-600 flex items-center justify-center text-[9px]">3</span>
                        <span>3. Hospital Accepts & Schedules</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <span className="w-4 h-4 rounded-full border border-neutral-600 flex items-center justify-center text-[9px]">4</span>
                        <span>4. BloodBag in Vault</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: DIGITAL DONOR CARD */}
        {activeTab === 'donor_card' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Holographic Donor Card */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-red-950/90 via-neutral-950 to-red-950/80 border border-red-500/40 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 tracking-wider uppercase">
                    <Droplet className="w-4 h-4 fill-red-400" />
                    LifeVault Certified Digital Donor Card
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                    Gold Life-Saver Status
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <div className="text-3xl font-extrabold text-white mb-1">{user?.name || 'Alexander Wright'}</div>
                    <div className="text-xs text-neutral-400 font-mono">ID: {user?.id || 'CIT-8021'} • {user?.phone || '+1 (555) 234-5678'}</div>
                  </div>
                  <div className="p-3 bg-white text-black rounded-2xl font-mono text-center font-extrabold shadow-xl">
                    <div className="text-3xl text-red-600">{user?.bloodGroup || user?.bloodgroup || 'O-'}</div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-tighter">Blood Group</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <div className="text-neutral-500">Last Donation:</div>
                  <div className="text-white font-bold">April 12, 2026 (95 Days Ago)</div>
                </div>
                <div>
                  <div className="text-neutral-500">Next Eligible:</div>
                  <div className="text-emerald-400 font-bold">Eligible Today</div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-white">
                  <QrCode className="w-4 h-4 text-red-400" />
                  <span>Scan at Blood Center</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col gap-6">
              <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.2)" className="rounded-3xl bg-neutral-950 border border-white/15 p-6 shadow-xl">
                <h4 className="text-base font-bold text-white mb-2">90-Day Eligibility Status</h4>
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  Your last donation was 95 days ago. You are eligible to donate Whole Blood or PRBC today!
                </p>
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Passed All Medical Criteria</span>
                </div>
                <div className="flex gap-2">
                  <AnimatedButton variant="danger" size="md" onClick={() => setActiveTab('giver')} className="flex-1">
                    <span>Donate as Giver</span>
                  </AnimatedButton>
                  <AnimatedButton variant="outline" size="md" onClick={onOpenFindBlood} className="flex-1">
                    <Search className="w-4 h-4" />
                    <span>Search Stocks</span>
                  </AnimatedButton>
                </div>
              </SpotlightCard>

              <SpotlightCard spotlightColor="rgba(239, 68, 68, 0.2)" className="rounded-3xl bg-neutral-950 border border-white/15 p-6 shadow-xl">
                <h4 className="text-base font-bold text-white mb-2">Need Emergency Blood?</h4>
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                  Raise an urgent request for yourself or a family member directly to regional blood banks.
                </p>
                <AnimatedButton variant="outline" size="md" onClick={() => setActiveTab('request_blood')} className="w-full">
                  <span>Raise Blood Request</span>
                </AnimatedButton>
              </SpotlightCard>
            </div>
          </div>
        )}

        {/* TAB 2: BOOK DONATION SLOT */}
        {activeTab === 'schedule' && (
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-red-500" />
              <span>Book Donation Appointment</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Choose a convenient certified blood center and time slot. Zero waiting time guaranteed.
            </p>

            {!appointment.booked ? (
              <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Blood Center Location</label>
                  <select
                    value={appointment.center}
                    onChange={(e) => setAppointment({ ...appointment, center: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="New York Central Blood Vault">New York Central Blood Vault</option>
                    <option value="Brooklyn Community Drive">Brooklyn Community Drive</option>
                    <option value="Chicago General Reserve">Chicago General Reserve</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={appointment.date}
                      onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Time Slot</label>
                    <select
                      value={appointment.slot}
                      onChange={(e) => setAppointment({ ...appointment, slot: e.target.value })}
                      className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-neutral-300 space-y-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                    <span>Eligibility Check Passed</span>
                  </div>
                  <p>Remember to drink plenty of fluids and bring your digital donor card!</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/60 transition-all"
                >
                  Confirm Appointment Slot
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Appointment Confirmed!</h4>
                <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6">
                  Your appointment at <strong className="text-white">{appointment.center}</strong> on <strong className="text-red-400">{appointment.date}</strong> at <strong className="text-white">{appointment.slot}</strong> is locked.
                </p>
                <button
                  onClick={() => setAppointment({ ...appointment, booked: false })}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
                >
                  Book Another Appointment
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REQUEST BLOOD MODULE */}
        {activeTab === 'request_blood' && (
          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-red-500" />
              <span>Raise Blood Request</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Submit a blood request for yourself or on behalf of a family member. System auto-matches with FEFO reserves.
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Patient / Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={bloodRequest.recipientName}
                    onChange={(e) => setBloodRequest({ ...bloodRequest, recipientName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Required Blood Group</label>
                  <select
                    value={bloodRequest.bloodGroup}
                    onChange={(e) => setBloodRequest({ ...bloodRequest, bloodGroup: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Units Needed (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={bloodRequest.units}
                    onChange={(e) => setBloodRequest({ ...bloodRequest, units: parseInt(e.target.value) || 1 })}
                    className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Hospital Location</label>
                  <input
                    type="text"
                    required
                    value={bloodRequest.hospitalName}
                    onChange={(e) => setBloodRequest({ ...bloodRequest, hospitalName: e.target.value })}
                    className="w-full p-3 rounded-xl bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2"
              >
                <Droplet className="w-4 h-4 fill-white" />
                <span>Submit Blood Request</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: MY REQUEST TRACKER */}
        {activeTab === 'my_requests' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">My Active Blood Request Log</h3>

            {userRequests.map((req) => (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-red-400 text-sm">{req.id}</span>
                    <span className="text-white font-bold">{req.recipient}</span>
                    <span className="px-2 py-0.5 bg-red-950 text-red-400 rounded border border-red-500/30">
                      {req.bloodGroup} • {req.units} Units
                    </span>
                  </div>
                  <div className="text-neutral-400">Hospital: {req.hospital}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">{req.status}</div>
                    <div className="text-neutral-500 text-[10px]">ETA: {req.eta}</div>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenPortalPage;
