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
} from 'lucide-react';
import { SpotlightCard, AnimatedButton } from '@ui/index';

export const CitizenPortalPage = ({ user, onOpenFindBlood }) => {
  const [activeTab, setActiveTab] = useState('donor_card');
  const [notification, setNotification] = useState(null);

  // Appointment Form State
  const [appointment, setAppointment] = useState({
    center: 'New York Central Blood Vault',
    date: '2026-08-05',
    slot: '10:00 AM',
    booked: false,
  });

  // Blood Request Form State
  const [bloodRequest, setBloodRequest] = useState({
    recipientName: user.name,
    isGuardian: false,
    bloodGroup: user.bloodGroup || 'O+',
    units: 2,
    hospitalName: 'St. Jude Emergency Care',
    urgency: 'URGENT_TRAUMA',
    submitted: false,
  });

  // Active Requests Log
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
      {/* Red ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Welcome Header */}
        <div className="p-6 md:p-8 rounded-3xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-red-500 shadow-lg shadow-red-950/50" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-2xl">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-400 font-mono text-xs font-bold">
                  {user.bloodGroup || 'O-'} Donor
                </span>
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-2">
                <span>Citizen Life-Saver Workspace</span>
                <span>•</span>
                <span className="text-emerald-400">Verified ID: {user.id}</span>
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
              <span className="text-xs text-red-400 uppercase">LOGGED</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-white/10 mb-8 text-xs font-medium">
          <button
            onClick={() => setActiveTab('donor_card')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'donor_card' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Digital Donor Card</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'schedule' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Book Donation Slot</span>
          </button>

          <button
            onClick={() => setActiveTab('request_blood')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'request_blood' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Blood Unit</span>
          </button>

          <button
            onClick={() => setActiveTab('my_requests')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
              activeTab === 'my_requests' ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Active Tracker ({userRequests.length})</span>
          </button>
        </div>

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
                    <div className="text-3xl font-extrabold text-white mb-1">{user.name}</div>
                    <div className="text-xs text-neutral-400 font-mono">ID: {user.id} • {user.phone || '+1 (555) 234-5678'}</div>
                  </div>
                  <div className="p-3 bg-white text-black rounded-2xl font-mono text-center font-extrabold shadow-xl">
                    <div className="text-3xl text-red-600">{user.bloodGroup || 'O-'}</div>
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
                  <AnimatedButton variant="danger" size="md" onClick={() => setActiveTab('schedule')} className="flex-1">
                    <span>Book Appointment</span>
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
              <div key={req.id} className="p-6 rounded-2xl bg-neutral-950 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
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
