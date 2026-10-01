import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Boxes,
  Search,
  Droplet,
  PackageCheck,
  Hourglass,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Building2,
  Loader2,
  X,
} from 'lucide-react';
import {
  getInventoryItems,
  getInventoryStock,
  getInventoryFacilities,
  fulfillInventoryItem,
  addBloodBag,
  discardBloodBag,
} from '../../services/inventoryService.js';

const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const STOCK_STYLE = {
  CRITICAL: 'border-red-500/40 text-red-400',
  LOW: 'border-amber-500/40 text-amber-400',
  OPTIMAL: 'border-emerald-500/30 text-emerald-400',
};

const ITEM_STATUS = {
  OPTIMAL: { label: 'Available', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  LOW: { label: 'Use Soon', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  CRITICAL: { label: 'Expiring Soon', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  EXPIRED: { label: 'Expired', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  UNFULFILLED: { label: 'Awaiting Receipt', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
};

const VIEW_FILTERS = [
  { value: 'ALL', label: 'All Units' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'AWAITING', label: 'Awaiting Receipt' },
  { value: 'EXPIRING', label: 'Expiring ≤ 7 days' },
];

const EMPTY_BAG = { inventory_id: '', bloodgroup: 'O+', weight: '450', haemoglobin: '', pressure: '', expiry_days: '35', barcode: '' };

const matchesView = (item, view) => {
  if (view === 'AVAILABLE') return item.rawStatus === 'AVAILABLE';
  if (view === 'AWAITING') return item.status === 'UNFULFILLED';
  if (view === 'EXPIRING') return item.rawStatus === 'AVAILABLE' && item.daysToExpiry !== null && item.daysToExpiry <= 7;
  return true;
};

const inputCls = 'w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40';

/** Blood vault inventory: admins see every facility, staff only their own (enforced by the API). */
export const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [stock, setStock] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [facilityId, setFacilityId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('ALL');
  const [view, setView] = useState('ALL');

  const [actionId, setActionId] = useState(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [bagForm, setBagForm] = useState(EMPTY_BAG);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (fid, showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [itemList, stockRes, facilityList] = await Promise.all([
        getInventoryItems(fid),
        getInventoryStock(fid),
        getInventoryFacilities(),
      ]);
      setItems(itemList);
      setStock(stockRes);
      setFacilities(facilityList);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(facilityId); }, [load, facilityId]);

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 5000);
  };

  const handleFulfill = async (item) => {
    setActionId(item.id);
    setError('');
    try {
      await fulfillInventoryItem(item.id);
      flash(`Unit ${item.barcode} received and added to stock.`);
      await load(facilityId);
    } catch (e) {
      setError(e.message);
    } finally {
      setActionId(null);
    }
  };

  const handleDiscard = async (item) => {
    setActionId(item.id);
    setError('');
    try {
      await discardBloodBag(item.id);
      setConfirmDiscardId(null);
      flash(`Unit ${item.barcode} discarded.`);
      await load(facilityId);
    } catch (e) {
      setError(e.message);
      setConfirmDiscardId(null);
    } finally {
      setActionId(null);
    }
  };

  const openAdd = () => {
    setBagForm({ ...EMPTY_BAG, inventory_id: facilities[0]?.inventoryId || '' });
    setShowAdd(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await addBloodBag(Object.fromEntries(Object.entries(bagForm).filter(([, v]) => v !== '')));
      setShowAdd(false);
      flash('Blood bag added to inventory.');
      await load(facilityId);
    } catch (err) {
      setError(err.message);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items
      .filter((i) => group === 'ALL' || i.type === group)
      .filter((i) => matchesView(i, view))
      .filter((i) => !term || [i.barcode, i.donorName, i.facilityName].some((v) => (v || '').toLowerCase().includes(term)))
      // First-expiring-first-out; units awaiting receipt (no expiry yet) go last
      .sort((a, b) => (a.status === 'UNFULFILLED') - (b.status === 'UNFULFILLED') || (a.daysToExpiry ?? 9999) - (b.daysToExpiry ?? 9999));
  }, [items, search, group, view]);

  const summary = stock?.summary;
  const usedPct = summary?.capacity ? Math.min(100, Math.round((summary.used / summary.capacity) * 100)) : 0;
  const groupsInStock = stock ? stock.stock.filter((g) => g.units > 0).length : 0;
  const selectedInventory = facilities.find((f) => f.inventoryId === bagForm.inventory_id);

  return (
    <section className="w-full space-y-8 animate-fadeIn">
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-medium">{notice}</span>
          </div>
          <button onClick={() => setNotice('')} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Boxes className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Blood Vault <span className="font-serif italic font-normal text-purple-400">Inventory</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">Live blood reserves, expiry-first (FEFO) ordering, intake and discard management.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => load(facilityId, true)} disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold group disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button onClick={openAdd} disabled={facilities.length === 0}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed">
            <Plus className="w-4 h-4" /> Add Blood Bag
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-500" /></div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Available Stock</span>
                <Droplet className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stock?.totalUnits ?? 0} Units</div>
              <div className="text-[11px] text-neutral-400 mt-1">{groupsInStock} of 8 blood groups in stock</div>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Receipt</span>
                <PackageCheck className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-3xl font-extrabold text-orange-400 tracking-tight">{summary?.unfulfilled ?? 0} Entries</div>
              <div className="text-[11px] text-neutral-400 mt-1">{summary?.unfulfilled ? 'Accepted donations not yet received' : 'All donations received'}</div>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-red-500/40 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Expiring ≤ 7 Days</span>
                <Hourglass className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{summary?.expiringSoon ?? 0} Units</div>
              <div className="text-[11px] text-neutral-400 mt-1">{summary?.expired ? `${summary.expired} already expired — discard them` : 'No expired units'}</div>
            </div>
            <div className="p-5 rounded-2xl bg-neutral-950/80 border border-white/10 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Capacity Used</span>
                <Gauge className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{usedPct}%</div>
              <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: `${usedPct}%` }} /></div>
              <div className="text-[11px] text-neutral-400 mt-1">{summary?.used ?? 0} of {summary?.capacity ?? 0} bag slots</div>
            </div>
          </div>

          {/* Stock by blood group */}
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
            {stock?.stock.map((g) => (
              <button key={g.type} onClick={() => setGroup(group === g.type ? 'ALL' : g.type)}
                className={`p-3 rounded-2xl bg-neutral-950/80 border text-center transition-all cursor-pointer ${STOCK_STYLE[g.status]} ${group === g.type ? 'ring-1 ring-purple-400' : ''}`}>
                <div className="text-sm font-bold font-mono">{g.type}</div>
                <div className="text-xl font-extrabold text-white">{g.units}</div>
                <div className="text-[9px] uppercase tracking-wider">{g.status}</div>
              </button>
            ))}
          </div>

          {/* Storage inventories (shown even when empty) */}
          <div className="rounded-2xl bg-neutral-950/80 border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-400" /> Storage Inventories
                <span className="text-[11px] font-normal text-neutral-500">{facilities.length}</span>
              </h2>
              {facilityId !== 'ALL' && (
                <button onClick={() => setFacilityId('ALL')} className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer">Show all</button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {facilities.map((f) => {
                const pct = f.capacity ? Math.min(100, Math.round((f.used / f.capacity) * 100)) : 0;
                const active = facilityId === f.facilityId;
                return (
                  <button key={f.inventoryId} onClick={() => facilities.length > 1 && setFacilityId(active ? 'ALL' : f.facilityId)}
                    className={`text-left rounded-xl bg-white/[0.03] border p-3.5 transition-colors ${active ? 'border-purple-500/60' : 'border-white/10 hover:border-purple-500/30'} ${facilities.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-tight truncate">{f.facilityName}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${f.facilityType === 'Hospital' ? 'text-blue-400 bg-blue-500/10' : 'text-red-400 bg-red-500/10'}`}>
                        {f.facilityType === 'Hospital' ? 'Hospital' : 'Blood Bank'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono mt-1">{f.cellno} • {f.shelfno}</p>
                    <div className="h-1.5 rounded-full bg-white/10 mt-2.5 overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} /></div>
                    <p className="text-[11px] text-neutral-400 mt-1.5">{f.used} / {f.capacity} slots used</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-white/10 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search barcode, donor, or facility..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50" />
            </div>
            <select value={group} onChange={(e) => setGroup(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 cursor-pointer w-full md:w-auto">
              <option value="ALL" className="bg-neutral-900">All Blood Groups</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg} className="bg-neutral-900">{bg}</option>)}
            </select>
            <select value={view} onChange={(e) => setView(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 cursor-pointer w-full md:w-auto">
              {VIEW_FILTERS.map((v) => <option key={v.value} value={v.value} className="bg-neutral-900">{v.label}</option>)}
            </select>
            {facilities.length > 1 && (
              <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-300 cursor-pointer w-full md:w-auto">
                <option value="ALL" className="bg-neutral-900">All Facilities</option>
                {facilities.map((f) => <option key={f.inventoryId} value={f.facilityId} className="bg-neutral-900">{f.facilityName}</option>)}
              </select>
            )}
          </div>

          {/* Table */}
          <div className="w-full rounded-2xl bg-neutral-950/80 border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Barcode</th>
                    <th className="py-3.5 px-4 font-semibold">Group</th>
                    <th className="py-3.5 px-4 font-semibold">Facility / Location</th>
                    <th className="py-3.5 px-4 font-semibold">Volume</th>
                    <th className="py-3.5 px-4 font-semibold">Donated</th>
                    <th className="py-3.5 px-4 font-semibold">Expiry (FEFO)</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-neutral-300">
                  {visibleItems.length === 0 ? (
                    <tr><td colSpan="8" className="py-12 text-center text-neutral-500">{items.length === 0 ? 'No blood bags stored yet — use "Add Blood Bag" or receive an accepted donation.' : 'No units match the filters.'}</td></tr>
                  ) : visibleItems.map((item) => {
                    const isUnfulfilled = item.status === 'UNFULFILLED';
                    const st = ITEM_STATUS[item.status] || { label: item.status, cls: 'bg-white/5 text-neutral-300 border-white/10' };
                    const canDiscard = !isUnfulfilled && !['ALLOCATED', 'TRANSFUSED'].includes(item.rawStatus);
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-white">
                          <div>{item.barcode}</div>
                          {item.donorName && <div className="text-[10px] text-neutral-500 font-sans">{item.donorName}</div>}
                        </td>
                        <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold font-mono">{item.type}</span></td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white flex items-center gap-1.5 max-w-[190px]"><Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span className="truncate">{item.facilityName}</span></div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{item.cellno} • {item.shelfno}</div>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-300">{item.volumeMl ? `${item.volumeMl} ml` : '—'}</td>
                        <td className="py-3.5 px-4 text-neutral-300">{item.dateOfDonation ? new Date(item.dateOfDonation).toLocaleDateString() : '—'}</td>
                        <td className={`py-3.5 px-4 ${item.daysToExpiry !== null && item.daysToExpiry <= 7 && !isUnfulfilled ? 'text-red-400 font-semibold' : 'text-neutral-300'}`}>{item.expiry}</td>
                        <td className="py-3.5 px-4"><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${st.cls}`}>{st.label}</span></td>
                        <td className="py-3.5 px-4 text-right">
                          {isUnfulfilled ? (
                            <button onClick={() => handleFulfill(item)} disabled={actionId === item.id}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ml-auto">
                              {actionId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />}<span>Receive</span>
                            </button>
                          ) : canDiscard ? (
                            confirmDiscardId === item.id ? (
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleDiscard(item)} disabled={actionId === item.id}
                                  className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold cursor-pointer disabled:opacity-50">{actionId === item.id ? '...' : 'Confirm'}</button>
                                <button onClick={() => setConfirmDiscardId(null)} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDiscardId(item.id)} title="Discard this unit"
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            )
                          ) : (
                            <span className="text-[11px] text-neutral-500 font-mono">{item.rawStatus}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add blood bag */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setShowAdd(false)}>
          <form onSubmit={handleAdd} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-3xl bg-neutral-950 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Add Blood Bag</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="text-neutral-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {facilities.length > 1 && (
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Facility <span className="text-purple-400">*</span></label>
                  <select required value={bagForm.inventory_id} onChange={(e) => setBagForm((f) => ({ ...f, inventory_id: e.target.value }))} className={inputCls}>
                    {facilities.map((f) => <option key={f.inventoryId} value={f.inventoryId} className="bg-neutral-900">{f.facilityName} ({f.used}/{f.capacity})</option>)}
                  </select>
                </div>
              )}
              {facilities.length === 1 && selectedInventory && (
                <p className="col-span-2 text-[11px] text-neutral-400">Adding to <span className="text-white font-semibold">{selectedInventory.facilityName}</span> ({selectedInventory.used}/{selectedInventory.capacity} slots used)</p>
              )}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Blood Group <span className="text-purple-400">*</span></label>
                <select required value={bagForm.bloodgroup} onChange={(e) => setBagForm((f) => ({ ...f, bloodgroup: e.target.value }))} className={inputCls}>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg} className="bg-neutral-900">{bg}</option>)}
                </select>
              </div>
              {[
                ['weight', 'Volume (ml)', 'number', '450'],
                ['haemoglobin', 'Haemoglobin (g/dL)', 'number', '13.5'],
                ['pressure', 'Blood Pressure', 'text', '120/80 mmHg'],
                ['expiry_days', 'Shelf Life (days)', 'number', '35'],
                ['barcode', 'Barcode (optional)', 'text', 'auto-generated'],
              ].map(([key, label, type, placeholder]) => (
                <div key={key}>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">{label}</label>
                  <input type={type} step={type === 'number' ? 'any' : undefined} min={type === 'number' ? 0 : undefined} placeholder={placeholder}
                    value={bagForm[key]} onChange={(e) => setBagForm((f) => ({ ...f, [key]: e.target.value }))} className={inputCls} />
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
              {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Add Blood Bag'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default InventoryPage;
