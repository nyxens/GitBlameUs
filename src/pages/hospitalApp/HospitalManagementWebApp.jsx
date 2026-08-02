import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Truck,
  Droplet,
  Thermometer,
  PlusCircle,
  FileCheck,
  Bell,
  X,
} from 'lucide-react';

export const HospitalManagementWebApp = ({ user, onOpenLanding }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [notification, setNotification] = useState(null);

  // Working Live Inventory State
  const [inventory, setInventory] = useState([
    { barcode: 'LV-UNIT-8091', type: 'O-', component: 'PRBC', units: 12, expiry: '4 Days (FEFO #1)', temp: '2.4°C', status: 'CRITICAL' },
    { barcode: 'LV-UNIT-8092', type: 'O+', component: 'Whole Blood', units: 180, expiry: '28 Days', temp: '2.5°C', status: 'OPTIMAL' },
    { barcode: 'LV-UNIT-8093', type: 'A+', component: 'FFP (Plasma)', units: 65, expiry: '120 Days', temp: '-18.2°C', status: 'OPTIMAL' },
    { barcode: 'LV-UNIT-8094', type: 'B-', component: 'Platelets', units: 8, expiry: '2 Days (FEFO #1)', temp: '22.1°C', status: 'CRITICAL' },
    { barcode: 'LV-UNIT-8095', type: 'AB+', component: 'PRBC', units: 45, expiry: '18 Days', temp: '2.3°C', status: 'OPTIMAL' },
  ]);

  // Working ER Requisitions State
  const [requisitions, setRequisitions] = useState([
    { id: 'ORD-9042', hospital: 'St. Jude Emergency ER', type: 'O- PRBC', units: 4, urgency: 'EMERGENCY TRAUMA', status: 'Pending Approval', eta: '15 mins' },
    { id: 'ORD-9043', hospital: 'Metro General ICU', type: 'A+ Whole Blood', units: 6, urgency: 'SURGICAL RESERVE', status: 'Approved & Courier En Route', eta: '8 mins' },
    { id: 'ORD-9044', hospital: 'City Trauma Center', type: 'B- Platelets', units: 2, urgency: 'ROUTINE TRANSFUSION', status: 'In Transit', eta: '22 mins' },
  ]);

  // New Unit Form Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUnit, setNewUnit] = useState({
    type: 'O-',
    component: 'PRBC',
    units: 5,
    barcode: `LV-UNIT-${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const handleAddStock = (e) => {
    e.preventDefault();
    const createdItem = {
      barcode: newUnit.barcode,
      type: newUnit.type,
      component: newUnit.component,
      units: newUnit.units,
      expiry: '35 Days',
      temp: '2.4°C',
      status: 'OPTIMAL',
    };
    setInventory([createdItem, ...inventory]);
    setAddModalOpen(false);
    setNotification(`New Blood Unit ${newUnit.barcode} (${newUnit.units} units of ${newUnit.type}) added to vault stock.`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApproveOrder = (orderId) => {
    setRequisitions((prev) =>
      prev.map((req) => (req.id === orderId ? { ...req, status: 'Approved & FEFO Units Reserved' } : req))
    );
    setNotification(`Requisition ${orderId} approved! Courier dispatched under 15-min SLA.`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-24 px-4 sm:px-8 md:px-16 relative">
      {/* Purple ambient background glow */}
      <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-purple-700/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hospital WebApp Header Bar */}
        <div className="p-6 md:p-8 rounded-3xl bg-neutral-950/90 border border-purple-500/30 backdrop-blur-2xl shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-purple-950/40">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Building2 className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  {user.hospitalName || 'St. Jude General Hospital'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
                  License: {user.licenseId || 'HOSP-NY-9042'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-2">
                <span>Online Blood Bank WebApp Management System</span>
                <span>•</span>
                <span className="text-emerald-400 font-mono">NODE-EAST-01 (ONLINE)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLanding}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
            >
              View Landing Page
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/60 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Blood Unit</span>
            </button>
          </div>
        </div>

        {/* System Toast Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-purple-200 text-xs flex items-center justify-between shadow-xl font-mono"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>{notification}</span>
              </div>
              <span className="text-xs text-purple-400 uppercase">SYSTEM LOGGED</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-950 p-1.5 rounded-2xl border border-white/10 mb-8 text-xs font-medium">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeTab === 'inventory' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>FEFO Stock Inventory ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeTab === 'orders' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>ER Requisitions & Dispatches</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeTab === 'telemetry' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span>Cold-Chain Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('lab_crossmatch')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeTab === 'lab_crossmatch' ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Lab Screening & Cross-Match</span>
          </button>
        </div>

        {/* TAB 1: FEFO INVENTORY TABLE */}
        {activeTab === 'inventory' && (
          <div className="p-6 md:p-8 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>First-Expired-First-Out (FEFO) Inventory Queue</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-xs font-mono">
                    Zero Waste Mode
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Stock units prioritized by earliest expiration to prevent wastage
                </p>
              </div>

              <div className="text-xs font-mono text-neutral-400">
                Total Reserve: <strong className="text-white">502 Units</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 uppercase">
                    <th className="pb-3">Barcode Tag</th>
                    <th className="pb-3">Blood Group</th>
                    <th className="pb-3">Component</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">FEFO Expiry</th>
                    <th className="pb-3">Storage Temp</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.map((item) => (
                    <tr key={item.barcode} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-purple-400 font-bold">{item.barcode}</td>
                      <td className="py-4 text-white font-extrabold text-sm">{item.type}</td>
                      <td className="py-4 text-neutral-300">{item.component}</td>
                      <td className="py-4 text-white font-bold">{item.units} Units</td>
                      <td className="py-4 text-amber-400">{item.expiry}</td>
                      <td className="py-4 text-emerald-400">{item.temp}</td>
                      <td className="py-4">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            item.status === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ER REQUISITIONS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Emergency Transfusion Requisitions</h3>

            {requisitions.map((req) => (
              <div
                key={req.id}
                className="p-6 rounded-2xl bg-neutral-950 border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-purple-400 text-sm">{req.id}</span>
                    <span className="text-white font-bold">{req.hospital}</span>
                    <span className="px-2 py-0.5 bg-red-950 text-red-400 rounded border border-red-500/30 text-[10px]">
                      {req.urgency}
                    </span>
                  </div>
                  <div className="text-neutral-400">
                    Requested: <strong className="text-white">{req.units} Units of {req.type}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">{req.status}</div>
                    <div className="text-neutral-500 text-[10px]">Courier SLA: {req.eta}</div>
                  </div>

                  {req.status.includes('Pending') && (
                    <button
                      onClick={() => handleApproveOrder(req.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-colors"
                    >
                      Approve & Dispatch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: COLD CHAIN TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-neutral-950 border border-white/15 text-xs font-mono shadow-xl">
              <div className="text-neutral-400 mb-1">RBC Vault Refrigerator #1</div>
              <div className="text-4xl font-extrabold text-emerald-400 mb-2">2.4°C</div>
              <div className="text-neutral-400">Target Range: 2.0°C - 6.0°C</div>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-950 border border-white/15 text-xs font-mono shadow-xl">
              <div className="text-neutral-400 mb-1">FFP Plasma Deep Freezer</div>
              <div className="text-4xl font-extrabold text-rose-400 mb-2">-18.2°C</div>
              <div className="text-neutral-400">Deep Freeze Protocol Active</div>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-950 border border-white/15 text-xs font-mono shadow-xl">
              <div className="text-neutral-400 mb-1">Power Backup Health</div>
              <div className="text-4xl font-extrabold text-white mb-2">100%</div>
              <div className="text-neutral-400">Dual Generator Ready</div>
            </div>
          </div>
        )}

        {/* TAB 4: LAB CROSS-MATCHING */}
        {activeTab === 'lab_crossmatch' && (
          <div className="p-8 rounded-3xl bg-neutral-950 border border-white/15 text-xs font-mono shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Laboratory Screening & Cross-Match Audit Log</h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Donor Bag #LV-UNIT-8091</div>
                  <div className="text-neutral-400">HIV, Hep-B, Hep-C, Syphilis: NEGATIVE</div>
                </div>
                <div className="text-emerald-400 font-bold">CROSS-MATCH COMPATIBLE</div>
              </div>
            </div>
          </div>
        )}

        {/* ADD UNIT MODAL */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-950 border border-white/15 text-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-white">Add New Collected Blood Unit</h4>
                <button onClick={() => setAddModalOpen(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStock} className="space-y-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Blood Group</label>
                  <select
                    value={newUnit.type}
                    onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-white/10 text-white"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Component</label>
                  <select
                    value={newUnit.component}
                    onChange={(e) => setNewUnit({ ...newUnit, component: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-white/10 text-white"
                  >
                    <option value="PRBC">Packed Red Blood Cells (PRBC)</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="FFP (Plasma)">Fresh Frozen Plasma (FFP)</option>
                    <option value="Platelets">Platelet Concentrate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={newUnit.units}
                    onChange={(e) => setNewUnit({ ...newUnit, units: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-lg bg-neutral-900 border border-white/10 text-white"
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl">
                  Add Unit to FEFO Vault Inventory
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
