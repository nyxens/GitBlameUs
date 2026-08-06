import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, MapPin, Search, CheckCircle2, Phone } from 'lucide-react';

export const FindBloodModal = ({ isOpen, onClose }) => {
  const [selectedBlood, setSelectedBlood] = useState('O-');
  const [city, setCity] = useState('New York');
  const [searched, setSearched] = useState(false);

  const mockVaults = [
    { name: 'Metro Central Blood Bank Vault', dist: '1.2 miles', available: 42, temp: '2.4°C', phone: '+1 (555) 019-2831' },
    { name: 'St. Jude Hospital Blood Reserve', dist: '3.8 miles', available: 18, temp: '2.6°C', phone: '+1 (555) 019-9482' },
    { name: 'Regional Emergency Storage Hub', dist: '5.5 miles', available: 65, temp: '2.2°C', phone: '+1 (555) 019-3310' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl rounded-2xl bg-neutral-950 border border-white/15 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Top red accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-purple-500 to-red-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500">
              <Droplet className="w-6 h-6 fill-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Find Blood Inventory</h3>
              <p className="text-xs text-neutral-400">Search regional blood banks & hospital reserves</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Required Blood Group
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                  <button
                    type="button"
                    key={group}
                    onClick={() => setSelectedBlood(group)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedBlood === group
                        ? 'bg-red-600 border-red-500 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">City or ZIP Code</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city or zip code"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Available Vaults</span>
            </button>
          </form>

          {searched && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Available Regional Vaults ({mockVaults.length})</span>
                <span className="text-red-400 font-mono">Blood: {selectedBlood}</span>
              </div>

              {mockVaults.map((vault, i) => (
                <div key={i} className="p-4 rounded-xl bg-neutral-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{vault.name}</h4>
                    <div className="flex items-center gap-3 text-neutral-400 font-mono">
                      <span>{vault.dist} away</span>
                      <span>•</span>
                      <span className="text-emerald-400">{vault.temp} storage</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="font-bold text-white text-sm font-mono">{vault.available} Units</div>
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </div>
                    </div>

                    <a
                      href={`tel:${vault.phone}`}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-red-400" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
