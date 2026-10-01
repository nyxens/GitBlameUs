import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Trash2, Loader2, Phone, MapPin, Boxes, X } from 'lucide-react';
import { getHospitals, createHospital, deleteHospital } from '../../services/hospitalService.js';

const EMPTY_FORM = { hos_name: '', pincode: '', phone: '', email: '', address: '', latitude: '', longitude: '', capacity: '' };

const FIELDS = [
  { key: 'hos_name', label: 'Hospital Name', required: true, span: 2 },
  { key: 'pincode', label: 'Pincode', required: true },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'capacity', label: 'Inventory Capacity', type: 'number', placeholder: '100' },
  { key: 'address', label: 'Address', span: 2 },
  { key: 'latitude', label: 'Latitude', type: 'number' },
  { key: 'longitude', label: 'Longitude', type: 'number' },
];

export const HospitalsPanel = ({ isAdmin }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await getHospitals();
      setHospitals(res.hospitals || []);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
      await createHospital(payload);
      setForm(EMPTY_FORM);
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
      await deleteHospital(id);
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(err.message);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  if (!loading && !isAdmin && hospitals.length === 0) return null;

  return (
    <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          <h2 className="text-sm font-bold text-white">{isAdmin ? 'Hospitals' : 'My Hospital'}</h2>
          <span className="text-[11px] text-neutral-500">{hospitals.length}</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Hospital
          </button>
        )}
      </div>

      {error && <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{error}</div>}

      {loading ? (
        <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-neutral-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[28rem] overflow-y-auto pr-1">
          {hospitals.map((h) => (
            <div key={h._id} className="rounded-xl bg-white/[0.03] border border-white/10 p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white leading-tight">{h.hos_name}</p>
                {isAdmin && (
                  confirmId === h._id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleDelete(h._id)} disabled={deletingId === h._id}
                        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-50">
                        {deletingId === h._id ? '...' : 'Confirm'}
                      </button>
                      <button onClick={() => setConfirmId(null)} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmId(h._id)} title="Delete hospital"
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
              </div>
              <div className="text-[11px] text-neutral-400 space-y-1">
                <p className="flex items-start gap-1.5"><MapPin className="w-3 h-3 mt-0.5 shrink-0 text-neutral-600" /><span>{h.address || '—'} <span className="font-mono text-neutral-300">{h.pincode}</span></span></p>
                {h.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0 text-neutral-600" />{h.phone}</p>}
                <p className="flex items-center gap-1.5">
                  <Boxes className="w-3 h-3 shrink-0 text-neutral-600" />
                  <span className="text-white font-semibold">{h.units} units</span>
                  {h.inventories[0] && <span>• {h.inventories[0].cellno} / {h.inventories[0].shelfno} • cap {h.inventories[0].capacity}</span>}
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
              <h3 className="text-base font-bold text-white">Add Hospital</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(({ key, label, required, type = 'text', span, placeholder }) => (
                <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">{label}{required && <span className="text-purple-400"> *</span>}</label>
                  <input type={type} step={type === 'number' ? 'any' : undefined} required={required} placeholder={placeholder}
                    value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Add Hospital'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HospitalsPanel;
