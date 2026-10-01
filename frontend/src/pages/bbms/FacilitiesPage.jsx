import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Droplets, Plus, Trash2, Loader2, Phone, Mail, MapPin, Boxes, Search, X } from 'lucide-react';
import { getHospitals, createHospital, deleteHospital } from '../../services/hospitalService.js';
import { getBloodBanks, createBloodBank, deleteBloodBank } from '../../services/bloodBankService.js';

const FACILITY_CONFIG = {
  hospital: {
    title: 'Hospitals',
    accent: 'Network',
    singular: 'Hospital',
    ownTitle: 'My Hospital',
    Icon: Building2,
    iconClass: 'text-blue-400',
    boxClass: 'bg-blue-500/10 border-blue-500/20',
    nameKey: 'hos_name',
    phoneKey: 'phone',
    list: async () => (await getHospitals()).hospitals,
    create: createHospital,
    remove: deleteHospital,
  },
  bloodbank: {
    title: 'Blood Banks',
    accent: 'Network',
    singular: 'Blood Bank',
    ownTitle: 'My Blood Bank',
    Icon: Droplets,
    iconClass: 'text-red-400',
    boxClass: 'bg-red-500/10 border-red-500/20',
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
    <section className="w-full space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${cfg.boxClass}`}>
            <cfg.Icon className={`w-6 h-6 ${cfg.iconClass}`} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {isAdmin ? cfg.title : cfg.ownTitle}{' '}
              {isAdmin && <span className="font-serif italic font-normal text-purple-400">{cfg.accent}</span>}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {isAdmin ? `Manage every ${cfg.singular.toLowerCase()} on the LifeVault network.` : `Details and stock for your ${cfg.singular.toLowerCase()}.`}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 self-start md:self-auto cursor-pointer">
            <Plus className="w-4 h-4" /> Add {cfg.singular}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">{cfg.title}</div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{items.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Available Units</div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{totalUnits}</div>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{error}</div>}

      {isAdmin && (
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${cfg.title.toLowerCase()} by name, pincode, address...`}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-950/90 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50" />
        </div>
      )}

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
            <div key={f._id} className="rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/30 transition-colors p-4 space-y-3">
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
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">{label}{required && <span className="text-purple-400"> *</span>}</label>
                  <input type={inputType} step={inputType === 'number' ? 'any' : undefined} required={required} placeholder={placeholder}
                    value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : `Add ${cfg.singular}`}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default FacilitiesPage;
