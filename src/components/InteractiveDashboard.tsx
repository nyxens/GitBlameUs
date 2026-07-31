import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Truck, RefreshCw, Send, Thermometer, Bell } from 'lucide-react';

export const InteractiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'telemetry' | 'donors'>('inventory');
  const [notification, setNotification] = useState<string | null>(null);

  // Live Inventory State
  const [inventory, setInventory] = useState([
    { type: 'O-', units: 48, status: 'Critical', color: 'text-red-400 bg-red-950/60 border-red-500/30' },
    { type: 'O+', units: 210, status: 'Optimal', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
    { type: 'A+', units: 185, status: 'Optimal', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
    { type: 'A-', units: 62, status: 'Low', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
    { type: 'B+', units: 140, status: 'Optimal', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
    { type: 'B-', units: 35, status: 'Critical', color: 'text-red-400 bg-red-950/60 border-red-500/30' },
    { type: 'AB+', units: 92, status: 'Optimal', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30' },
    { type: 'AB-', units: 28, status: 'Critical', color: 'text-red-400 bg-red-950/60 border-red-500/30' },
  ]);

  // Orders State
  const [orders, setOrders] = useState([
    { id: 'ORD-9042', hospital: 'St. Jude Emergency ER', type: 'O- Negative', units: 4, urgency: 'EMERGENCY TRAUMA', status: 'Pending' },
    { id: 'ORD-9043', hospital: 'Metro General ICU', type: 'A+ Positive', units: 6, urgency: 'SURGICAL RESERVE', status: 'Approved' },
    { id: 'ORD-9044', hospital: 'City Trauma Center', type: 'B+ Positive', units: 2, urgency: 'ROUTINE TRANSFUSION', status: 'In Transit' },
  ]);

  const handleDispatchUnit = (type: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.type === type ? { ...item, units: Math.max(0, item.units - 2) } : item
      )
    );
    setNotification(`Emergency Dispatch of 2 units [${type}] dispatched to ER.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApproveOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'Approved & Courier En Route' } : ord))
    );
    setNotification(`Order ${orderId} approved! Urgent courier dispatched.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="w-full bg-neutral-950 border border-white/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl text-left select-none">
      {/* Top Application Bar */}
      <div className="px-4 py-3 bg-neutral-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* Left Mac-style Window Controls + WebApp Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
            <span className="text-purple-400">LifeVault WebApp</span>
            <span className="text-neutral-500">/</span>
            <span className="text-neutral-300">Live Hospital Portal</span>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Blood Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>ER Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Cold-Chain Vault</span>
          </button>
        </div>

        {/* Live Pulse Sensor */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
          <span>Live Vault Sync</span>
        </div>
      </div>

      {/* Notification Toast Alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-2 bg-purple-950 border-b border-purple-500/40 text-purple-200 text-xs flex items-center justify-between font-mono"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400 animate-bounce" />
              <span>{notification}</span>
            </div>
            <span className="text-[10px] text-purple-400 uppercase">SYSTEM LOGGED</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Body Content Area */}
      <div className="p-6 bg-black/60 min-h-[380px]">
        {/* TAB 1: BLOOD INVENTORY */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  Regional Blood Vault Stock
                  <span className="text-[10px] font-mono font-normal text-neutral-400">
                    (Click any group to simulate emergency dispatch)
                  </span>
                </h4>
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                Total Reserve: <strong className="text-white">817 Units</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {inventory.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleDispatchUnit(item.type)}
                  className={`p-3.5 rounded-xl border ${item.color} text-left flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-white">{item.type}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/50">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-white mb-2">
                    {item.units} <span className="text-xs text-neutral-400 font-normal">units</span>
                  </div>
                  <div className="text-[11px] text-purple-300 group-hover:text-white flex items-center gap-1">
                    <Send className="w-3 h-3 text-purple-400" />
                    <span>Click to Dispatch</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ER ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white">Hospital Emergency Transfusion Orders</h4>
              <div className="text-xs text-neutral-400 font-mono">3 Active Hospital Directives</div>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-neutral-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-purple-400">{ord.id}</span>
                      <span className="text-white font-semibold">{ord.hospital}</span>
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono text-[10px]">
                        {ord.urgency}
                      </span>
                    </div>
                    <div className="text-neutral-400">
                      Requested: <strong className="text-white">{ord.units} Units of {ord.type}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-mono">{ord.status}</span>
                    {ord.status === 'Pending' && (
                      <button
                        onClick={() => handleApproveOrder(ord.id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors"
                      >
                        Approve Dispatch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COLD CHAIN TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">Cold-Chain Storage Refrigerator Lockers</h4>
              <div className="text-xs text-emerald-400 font-mono">All 12 Lockers Within Safety Range</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-xs">
                <div className="text-neutral-400 mb-1">Main Storage Vault Temp</div>
                <div className="text-3xl font-mono font-bold text-emerald-400 mb-2">2.4°C</div>
                <div className="text-[11px] text-neutral-400">Target Range: 2.0°C - 6.0°C</div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-xs">
                <div className="text-neutral-400 mb-1">Emergency Plasma Unit</div>
                <div className="text-3xl font-mono font-bold text-purple-400 mb-2">-18.2°C</div>
                <div className="text-[11px] text-neutral-400">Deep Freeze Protocol Active</div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-xs">
                <div className="text-neutral-400 mb-1">Power Backup Health</div>
                <div className="text-3xl font-mono font-bold text-white mb-2">100%</div>
                <div className="text-[11px] text-emerald-400">Dual Generator Ready</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
