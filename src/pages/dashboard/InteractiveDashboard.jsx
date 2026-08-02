import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet } from 'lucide-react';

export const InteractiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('reserve');

  // 1. Blood Reserve Data
  const bloodReserves = [
    { type: 'O-', units: 48, component: 'PRBC', status: 'Critical Level', color: 'text-red-400 border-red-500/30 bg-red-950/20' },
    { type: 'O+', units: 210, component: 'Whole Blood', status: 'Optimal', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' },
    { type: 'A+', units: 185, component: 'PRBC', status: 'Optimal', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' },
    { type: 'A-', units: 62, component: 'Platelets', status: 'Low Stock', color: 'text-amber-400 border-amber-500/30 bg-amber-950/20' },
    { type: 'B+', units: 140, component: 'Plasma (FFP)', status: 'Optimal', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' },
    { type: 'B-', units: 35, component: 'PRBC', status: 'Critical Level', color: 'text-red-400 border-red-500/30 bg-red-950/20' },
    { type: 'AB+', units: 92, component: 'Cryo', status: 'Optimal', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' },
    { type: 'AB-', units: 28, component: 'PRBC', status: 'Critical Level', color: 'text-red-400 border-red-500/30 bg-red-950/20' },
  ];

  // 2. Active Requests Data
  const bloodRequests = [
    { id: 'REQ-9401', hospital: 'St. Jude Trauma Center', group: 'O-', units: 6, priority: 'EMERGENCY ER', status: 'Dispatched (ETA 8m)', color: 'text-red-400' },
    { id: 'REQ-9402', hospital: 'Metro General Hospital', group: 'A+', units: 4, priority: 'Surgical ICU', status: 'In Processing', color: 'text-purple-400' },
    { id: 'REQ-9403', hospital: 'University Children’s', group: 'B+', units: 2, priority: 'Pediatric Care', status: 'Ready for Courier', color: 'text-emerald-400' },
    { id: 'REQ-9404', hospital: 'City Memorial Vault', group: 'AB-', units: 3, priority: 'Emergency ER', status: 'In Transit (ETA 14m)', color: 'text-amber-400' },
  ];

  // 3. Supply Pipeline Data
  const supplyShipments = [
    { batch: 'SUP-810', source: 'Red Cross Drive #4', group: 'O+ & A+', units: 45, temp: '3.2°C', status: 'Inspected & Vaulted' },
    { batch: 'SUP-811', source: 'Central Clinic Intake', group: 'O- Universal', units: 18, temp: '2.8°C', status: 'Cold-Chain Verified' },
    { batch: 'SUP-812', source: 'Regional Mobile Drive', group: 'B+ & AB+', units: 32, temp: '3.0°C', status: 'In Quarantine Log' },
    { batch: 'SUP-813', source: 'Community Center Drive', group: 'A- Platelets', units: 12, temp: '22.0°C', status: 'Agitator Vaulted' },
  ];

  return (
    <div className="w-full bg-black/90 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl text-left select-none">
      
      {/* Top Plain Menu Header Bar */}
      <div className="px-6 py-4 bg-neutral-950 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Droplet className="w-4 h-4 fill-purple-400/20" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">LifeVault BBMS</div>
            <div className="text-[11px] text-purple-300/70 font-mono">Live Inventory Control System</div>
          </div>
        </div>

        {/* 3 Plain Menus: Blood Reserve, Requests Menu, Supply Menu */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-neutral-900 border border-white/10">
          <button
            onClick={() => setActiveTab('reserve')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'reserve'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200/70 hover:text-white'
            }`}
          >
            Blood Reserve
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200/70 hover:text-white'
            }`}
          >
            Requests Menu
          </button>

          <button
            onClick={() => setActiveTab('supply')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'supply'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-purple-200/70 hover:text-white'
            }`}
          >
            Supply Menu
          </button>
        </div>

      </div>

      {/* Main Panel Content */}
      <div className="p-6 md:p-8 bg-black">
        
        {/* MENU 1: BLOOD RESERVE */}
        {activeTab === 'reserve' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Blood Reserve Inventory</h3>
                <p className="text-xs text-purple-200/70">Real-time stock monitoring by ABO/Rh group & component type</p>
              </div>
              <div className="text-xs font-bold text-purple-300 font-mono bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
                Total Reserve: <span className="text-white">800 Units</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bloodReserves.map((item) => (
                <div
                  key={item.type}
                  className={`p-4 rounded-2xl border ${item.color} text-left flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-black text-white">{item.type}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{item.status}</span>
                  </div>

                  <div>
                    <div className="text-3xl font-black text-white font-mono leading-none mb-1">
                      {item.units} <span className="text-xs font-sans font-normal text-purple-200/70">units</span>
                    </div>
                    <div className="text-xs text-purple-300/80 font-semibold">{item.component}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENU 2: REQUESTS MENU */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Active Hospital Requisitions</h3>
                <p className="text-xs text-purple-200/70">Emergency trauma & surgical blood dispatch queue</p>
              </div>
              <div className="text-xs font-bold text-purple-300 font-mono bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
                Active Orders: <span className="text-white">{bloodRequests.length} Requisitions</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-purple-300 uppercase tracking-wider">
                    <th className="pb-3">Requisition ID</th>
                    <th className="pb-3">Hospital Facility</th>
                    <th className="pb-3">Blood Group</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bloodRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="py-3.5 text-purple-400 font-bold">{req.id}</td>
                      <td className="py-3.5 text-white font-bold">{req.hospital}</td>
                      <td className="py-3.5 text-white font-extrabold text-sm">{req.group}</td>
                      <td className="py-3.5 text-purple-200">{req.units} Units</td>
                      <td className="py-3.5">
                        <span className={`font-bold ${req.color}`}>{req.priority}</span>
                      </td>
                      <td className="py-3.5 text-emerald-400 font-semibold">{req.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MENU 3: SUPPLY MENU */}
        {activeTab === 'supply' && (
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Donor & Mobile Drive Supply Pipeline</h3>
                <p className="text-xs text-purple-200/70">Incoming blood intake & cold-chain storage logging</p>
              </div>
              <div className="text-xs font-bold text-purple-300 font-mono bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
                Incoming Batches: <span className="text-white">{supplyShipments.length} Pipeline Intake</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-purple-300 uppercase tracking-wider">
                    <th className="pb-3">Batch ID</th>
                    <th className="pb-3">Source Drive / Facility</th>
                    <th className="pb-3">Blood Types</th>
                    <th className="pb-3">Volume Collected</th>
                    <th className="pb-3">Cold-Chain Temp</th>
                    <th className="pb-3">Intake Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {supplyShipments.map((supply) => (
                    <tr key={supply.batch} className="hover:bg-purple-950/20 transition-colors">
                      <td className="py-3.5 text-purple-400 font-bold">{supply.batch}</td>
                      <td className="py-3.5 text-white font-bold">{supply.source}</td>
                      <td className="py-3.5 text-white font-semibold">{supply.group}</td>
                      <td className="py-3.5 text-purple-200">{supply.units} Units</td>
                      <td className="py-3.5 text-emerald-400 font-bold">{supply.temp}</td>
                      <td className="py-3.5 text-blue-400 font-semibold">{supply.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
