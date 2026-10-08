import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Droplets, Plus, Trash2, Loader2, Phone, Mail, MapPin, Boxes, Search, X } from 'lucide-react';
import { getHospitals, createHospital, deleteHospital } from '../../services/hospitalService.js';
import { getBloodBanks, createBloodBank, deleteBloodBank } from '../../services/bloodBankService.js';

const FACILITY_CONFIG = {
  hospital: {
    title: 'Hospitals',
    singular: 'Hospital',
    ownTitle: 'My Hospital',
    Icon: Building2,
    iconClass: 'text-blue-400',
    boxClass: 'bg-blue-500/10 border-blue-500/25 shadow-[0_0_24px_rgba(59,130,246,0.2)]',
    btnClass: 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.35)]',
    borderHover: 'hover:border-blue-500/40',
    cardBorderHover: 'hover:border-blue-500/30',
    focusBorder: 'focus:border-blue-500/50',
    accentText: 'text-blue-400',
    nameKey: 'hos_name',
    phoneKey: 'phone',
    list: async () => (await getHospitals()).hospitals,
    create: createHospital,
    remove: deleteHospital,
  },
  bloodbank: {
    title: 'Blood Banks',
    singular: 'Blood Bank',
    ownTitle: 'My Blood Bank',
    Icon: Droplets,
    iconClass: 'text-red-400',
    boxClass: 'bg-red-500/10 border-red-500/25 shadow-[0_0_24px_rgba(239,68,68,0.2)]',
    btnClass: 'bg-red-600 hover:bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.35)]',
    borderHover: 'hover:border-red-500/40',
    cardBorderHover: 'hover:border-red-500/30',
    focusBorder: 'focus:border-red-500/50',
    accentText: 'text-red-400',
    nameKey: 'bank_name',
    phoneKey: 'contact_no',
    list: async () => (await getBloodBanks()).bloodBanks,
    create: createBloodBank,
    remove: deleteBloodBank,
  },
};

const buildFields = (cfg) => [
  { key: cfg.nameKey, label: `${cfg.singular} Name`, required: true, span: 2 },
  { key: 'pincode', label: 'Pincode', required: true },
  { key: cfg.phoneKey, label: 'Phone' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'capacity', label: 'Inventory Capacity', type: 'number', placeholder: '100' },
  { key: 'address', label: 'Address', span: 2 },
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
];

/** Lists hospitals or blood banks (admin: all + add/delete; staff: their own facility only). */
export const FacilitiesPage = ({ type, isAdmin }) => {
  const cfg = FACILITY_CONFIG[type];
  const fields = buildFields(cfg);
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, '']));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await cfg.list());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [cfg]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await cfg.create(Object.fromEntries(Object.entries(form).filter(([, v]) => v !== '')));
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError('');
    try {
      await cfg.remove(id);
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(err.message);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const term = search.trim().toLowerCase();
  const visible = items.filter((f) =>
    [f[cfg.nameKey], f.pincode, f.address, f.email].some((v) => (v || '').toLowerCase().includes(term))
  );
  const totalUnits = items.reduce((sum, f) => sum + f.units, 0);

  return (
    <section className="w-full space-y-6 animate-fadeIn">
      {/* 1. Header: Logo + Title + Primary Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${cfg.boxClass}`}>
            <cfg.Icon className={`w-6 h-6 ${cfg.iconClass}`} />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {isAdmin ? cfg.title : cfg.ownTitle}
          </h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className={`px-3.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-2 self-start md:self-auto cursor-pointer transition-all ${cfg.btnClass}`}
          >
            <Plus className="w-4 h-4" /> Add {cfg.singular}
          </button>
        )}
      </div>

      {/* 2. Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl bg-[#0b0b0e] border border-white/10 ${cfg.borderHover} hover:bg-[#141418] transition-colors duration-200 select-none group`}>
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider group-hover:${cfg.accentText} transition-colors`}>
                Total {cfg.title}
              </span>
              <div className={`p-1.5 rounded-lg bg-white/5 text-neutral-400 group-hover:${cfg.accentText} transition-colors`}>
                <cfg.Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{items.length}</div>
          </div>
          <div className="text-[11px] text-neutral-400 truncate">Registered {cfg.title.toLowerCase()} on network</div>
        </div>

        <div className={`h-[136px] flex flex-col justify-between p-5 rounded-2xl bg-[#0b0b0e] border border-white/10 ${cfg.borderHover} hover:bg-[#141418] transition-colors duration-200 select-none group`}>
          <div>
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className={`text-xs font-semibold uppercase tracking-wider group-hover:${cfg.accentText} transition-colors`}>
                Available Units
              </span>
              <div className={`p-1.5 rounded-lg bg-white/5 text-neutral-400 group-hover:${cfg.accentText} transition-colors`}>
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {totalUnits} <span className={`text-lg font-normal ${cfg.accentText}`}>Units</span>
            </div>
          </div>
          <div className="text-[11px] text-neutral-400 truncate">Total blood vault reserves stored</div>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{error}</div>}

      {/* 3. Search Bar */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-[#0e0e11] border border-white/10 relative z-10 shadow-xl">
          <div className="relative w-full group">
            <Search className="w-4 h-4 text-neutral-500 group-focus-within:text-white transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${cfg.title.toLowerCase()} by name, pincode, address...`}
              className={`w-full pl-10 pr-4 py-2.5 bg-[#141417] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none ${cfg.focusBorder} transition-colors`}
            />
          </div>
        </div>
      )}

      {/* 4. Facilities Grid */}
      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-500" /></div>
      ) : visible.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-500 rounded-2xl bg-neutral-950/60 border border-white/10">
          {items.length === 0 && !isAdmin
            ? `Your account isn't linked to a ${cfg.singular.toLowerCase()}.`
            : `No ${cfg.title.toLowerCase()} found.`}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((f) => (
            <div key={f._id} className={`rounded-2xl bg-[#0b0b0e] border border-white/10 ${cfg.cardBorderHover} transition-colors p-4 space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-white leading-tight">{f[cfg.nameKey]}</p>
                {isAdmin && (
                  confirmId === f._id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleDelete(f._id)} disabled={deletingId === f._id}
                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-50">
                        {deletingId === f._id ? '...' : 'Confirm'}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(f._id)} title={`Delete ${cfg.singular.toLowerCase()}`}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
              </div>
              <div className="text-[11px] text-neutral-400 space-y-1.5">
                <p className="flex items-start gap-1.5"><MapPin className="w-3 h-3 mt-0.5 shrink-0 text-neutral-600" /><span>{f.address || '—'} <span className="font-mono text-neutral-300">{f.pincode}</span></span></p>
                {f[cfg.phoneKey] && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0 text-neutral-600" />{f[cfg.phoneKey]}</p>}
                {f.email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0 text-neutral-600" />{f.email}</p>}
                <p className="flex items-center gap-1.5">
                  <Boxes className="w-3 h-3 shrink-0 text-neutral-600" />
                  <span className="text-white font-semibold">{f.units} units</span>
                  {f.inventories[0] && <span>• {f.inventories[0].cellno} / {f.inventories[0].shelfno} • cap {f.inventories[0].capacity}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setShowForm(false)}>
          <form onSubmit={handleCreate} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-neutral-950 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add {cfg.singular}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(({ key, label, required, type: inputType = 'text', span, placeholder }) => (
                <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">{label}{required && <span className={cfg.accentText}> *</span>}</label>
                  <input type={inputType} step={inputType === 'number' ? 'any' : undefined} required={required} placeholder={placeholder}
                    value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none ${cfg.focusBorder}`} />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving}
              className={`w-full py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all ${cfg.btnClass}`}>
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : `Add ${cfg.singular}`}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default FacilitiesPage;
