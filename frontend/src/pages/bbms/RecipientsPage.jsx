import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  Activity,
  AlertTriangle,
  Clock,
  Building2,
  CheckCircle2,
  HeartPulse,
  ChevronDown,
  X,
} from 'lucide-react';

export const RecipientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  // Active Recipient Requisitions State
  const [recipients, setRecipients] = useState([
    {
      id: 'RCP-8091',
      patientName: 'David Miller',
      hospital: 'St. Jude Emergency Trauma ER',
      bloodGroup: 'O-',
      component: 'PRBC (Red Blood Cells)',
      units: 3,
      urgency: 'EMERGENCY TRAUMA',
      requiredBy: 'Immediate (< 30 mins)',
      status: 'ALLOCATED',
      authorizedStaff: 'Dr. Marcus Vance',
      pincode: '10001',
      date: 'Today, 10:15 AM',
    },
    {
      id: 'RCP-8092',
      patientName: 'Sophia Lin',
      hospital: 'Metro General ICU - Room 402',
      bloodGroup: 'A+',
      component: 'Whole Blood',
      units: 2,
      urgency: 'SURGICAL RESERVE',
      requiredBy: 'Today, 2:00 PM',
      status: 'APPROVED',
      authorizedStaff: 'Dr. Sarah Jenkins',
      pincode: '10014',
      date: 'Today, 09:30 AM',
    },
    {
      id: 'RCP-8093',
      patientName: 'James Wilson',
      hospital: 'City Children’s Oncology Center',
      bloodGroup: 'B-',
      component: 'Platelets (Single Donor)',
      units: 1,
      urgency: 'ROUTINE TRANSFUSION',
      requiredBy: 'Tomorrow, 10:00 AM',
      status: 'PENDING',
      authorizedStaff: 'Dr. Elena Rostova',
      pincode: '10022',
      date: 'Today, 08:45 AM',
    },
    {
      id: 'RCP-8094',
      patientName: 'Amara Okafor',
      hospital: 'Mount Sinai Trauma Resuscitation',
      bloodGroup: 'O+',
      component: 'PRBC',
      units: 4,
      urgency: 'EMERGENCY TRAUMA',
      requiredBy: 'Immediate (< 15 mins)',
      status: 'FULFILLED',
      authorizedStaff: 'Dr. Marcus Vance',
      pincode: '10029',
      date: 'Yesterday, 11:20 PM',
    },
    {
      id: 'RCP-8095',
      patientName: 'Robert Martinez',
      hospital: 'Presbyterian Cardiovascular Ward',
      bloodGroup: 'AB+',
      component: 'FFP (Fresh Frozen Plasma)',
      units: 2,
      urgency: 'SURGICAL RESERVE',
      requiredBy: 'Oct 24, 8:00 AM',
      status: 'ALLOCATED',
      authorizedStaff: 'Dr. K. Chen',
      pincode: '10032',
      date: 'Yesterday, 04:10 PM',
    },
    {
      id: 'RCP-8096',
      patientName: 'Clara Bennett',
      hospital: 'Bellevue Acute Care Center',
      bloodGroup: 'A-',
      component: 'PRBC',
      units: 1,
      urgency: 'ROUTINE TRANSFUSION',
      requiredBy: 'Oct 25, 11:30 AM',
      status: 'PENDING',
      authorizedStaff: 'Dr. Sarah Jenkins',
      pincode: '10016',
      date: 'Yesterday, 01:50 PM',
    },
  ]);

  // New Recipient Form State
  const [newRequisition, setNewRequisition] = useState({
    patientName: '',
    hospital: '',
    bloodGroup: 'O-',
    component: 'PRBC',
    units: 1,
    urgency: 'EMERGENCY TRAUMA',
    requiredBy: 'Immediate',
    pincode: '',
  });

  const handleCreateRequisition = (e) => {
    e.preventDefault();
    const created = {
      id: `RCP-${Math.floor(8100 + Math.random() * 900)}`,
      patientName: newRequisition.patientName || 'Emergency Patient',
      hospital: newRequisition.hospital || 'Metro Health Center',
      bloodGroup: newRequisition.bloodGroup,
      component: newRequisition.component,
      units: Number(newRequisition.units) || 1,
      urgency: newRequisition.urgency,
      requiredBy: newRequisition.requiredBy || 'Within 2 Hours',
      status: 'PENDING',
      authorizedStaff: 'On-Call Transfusionist',
      pincode: newRequisition.pincode || '10001',
      date: 'Just now',
    };
    setRecipients([created, ...recipients]);
    setModalOpen(false);
    setNewRequisition({
      patientName: '',
      hospital: '',
      bloodGroup: 'O-',
      component: 'PRBC',
      units: 1,
      urgency: 'EMERGENCY TRAUMA',
      requiredBy: 'Immediate',
      pincode: '',
    });
  };

  // Filtered recipients
  const filteredRecipients = recipients.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pincode.includes(searchTerm);

    const matchesBlood = bloodGroupFilter === 'ALL' || r.bloodGroup === bloodGroupFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;

    return matchesSearch && matchesBlood && matchesStatus && matchesUrgency;
  });

  // Quick Stats
  const totalActive = recipients.filter((r) => r.status !== 'FULFILLED').length;
  const criticalTrauma = recipients.filter(
    (r) => r.urgency === 'EMERGENCY TRAUMA' && r.status !== 'FULFILLED'
  ).length;
  const totalFulfilled = recipients.filter((r) => r.status === 'FULFILLED').length;

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Blood <span className="font-serif italic font-normal text-emerald-400">Recipients</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Active patient requisitions, clinical compatibility matches, and emergency transfusion allocation queue.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all duration-200 flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Recipient Request</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Queue</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{totalActive}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Patients awaiting allocation</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Trauma Critical</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 tracking-tight">{criticalTrauma}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Emergency &lt; 30 min required</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compatibility Match</span>
            <HeartPulse className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">99.4%</div>
          <div className="text-[11px] text-neutral-400 mt-1">Crossmatch verification rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fulfilled Today</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{totalFulfilled + 12}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Units securely delivered</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-neutral-950/90 border border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name, hospital, requisition ID, or pincode..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Blood Group Filter */}
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-neutral-900 text-white">All Blood Groups</option>
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
              <option key={bg} value={bg} className="bg-neutral-900 text-white">{bg}</option>
            ))}
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-neutral-900 text-white">All Urgencies</option>
            <option value="EMERGENCY TRAUMA" className="bg-neutral-900 text-red-400">Emergency Trauma</option>
            <option value="SURGICAL RESERVE" className="bg-neutral-900 text-amber-400">Surgical Reserve</option>
            <option value="ROUTINE TRANSFUSION" className="bg-neutral-900 text-blue-400">Routine Transfusion</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-neutral-900 text-white">All Statuses</option>
            <option value="PENDING" className="bg-neutral-900 text-white">Pending</option>
            <option value="APPROVED" className="bg-neutral-900 text-white">Approved</option>
            <option value="ALLOCATED" className="bg-neutral-900 text-white">Allocated</option>
            <option value="FULFILLED" className="bg-neutral-900 text-white">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* Recipients Data Table */}
      <div className="w-full rounded-2xl bg-neutral-950/80 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Recipient / ID</th>
                <th className="py-3.5 px-4 font-semibold">Medical Facility</th>
                <th className="py-3.5 px-4 font-semibold">Blood Group</th>
                <th className="py-3.5 px-4 font-semibold">Required Component</th>
                <th className="py-3.5 px-4 font-semibold">Units</th>
                <th className="py-3.5 px-4 font-semibold">Urgency</th>
                <th className="py-3.5 px-4 font-semibold">Required By</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300 font-sans">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-neutral-500">
                    No recipient requests match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div>{item.patientName}</div>
                      <div className="font-mono text-[10px] text-neutral-400">{item.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-neutral-300">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{item.hospital}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">PIN: {item.pincode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono">
                        {item.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">{item.component}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{item.units} Units</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          item.urgency === 'EMERGENCY TRAUMA'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : item.urgency === 'SURGICAL RESERVE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-neutral-300">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{item.requiredBy}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{item.date}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'FULFILLED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'ALLOCATED'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : item.status === 'APPROVED'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status === 'PENDING' ? (
                        <button
                          onClick={() => {
                            setRecipients(
                              recipients.map((r) =>
                                r.id === item.id ? { ...r, status: 'ALLOCATED' } : r
                              )
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Allocate Unit
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setRecipients(
                              recipients.map((r) =>
                                r.id === item.id ? { ...r, status: 'FULFILLED' } : r
                              )
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-[11px] transition-colors cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Recipient Request Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-neutral-950 border border-white/15 p-6 md:p-8 relative shadow-2xl"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create Recipient Request</h3>
                  <p className="text-xs text-neutral-400">Emergency blood requisition intake form</p>
                </div>
              </div>

              <form onSubmit={handleCreateRequisition} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maria Gonzalez"
                    value={newRequisition.patientName}
                    onChange={(e) =>
                      setNewRequisition({ ...newRequisition, patientName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Blood Group</label>
                    <select
                      value={newRequisition.bloodGroup}
                      onChange={(e) =>
                        setNewRequisition({ ...newRequisition, bloodGroup: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Units Required</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRequisition.units}
                      onChange={(e) =>
                        setNewRequisition({ ...newRequisition, units: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Urgency Level</label>
                    <select
                      value={newRequisition.urgency}
                      onChange={(e) =>
                        setNewRequisition({ ...newRequisition, urgency: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="EMERGENCY TRAUMA">Emergency Trauma</option>
                      <option value="SURGICAL RESERVE">Surgical Reserve</option>
                      <option value="ROUTINE TRANSFUSION">Routine Transfusion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">Component</label>
                    <select
                      value={newRequisition.component}
                      onChange={(e) =>
                        setNewRequisition({ ...newRequisition, component: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="PRBC">PRBC (Packed Cells)</option>
                      <option value="Whole Blood">Whole Blood</option>
                      <option value="Platelets">Platelets</option>
                      <option value="FFP (Plasma)">FFP (Plasma)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Hospital / Medical Center</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St. Jude Emergency Center Room 102"
                    value={newRequisition.hospital}
                    onChange={(e) =>
                      setNewRequisition({ ...newRequisition, hospital: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    Submit Requisition
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecipientsPage;
