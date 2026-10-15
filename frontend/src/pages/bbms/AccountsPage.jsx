import React, { useState, useEffect, useCallback } from 'react';
import { KeyRound, Plus, Trash2, Pencil, Loader2, X, Copy, Check } from 'lucide-react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../services/accountService.js';
import { getHospitals } from '../../services/hospitalService.js';
import { getBloodBanks } from '../../services/bloodBankService.js';

const STAFF_ROLES = ['DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHLEBOTOMIST', 'MANAGER', 'STAFF'];
const inputCls = 'w-full px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/40';

/**
 * Master admin: create & manage each organization's admin.
 * Organization admin: create & manage staff of their own organization.
 */
export const AccountsPage = ({ isMaster }) => {
  const [accounts, setAccounts] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | account
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [issued, setIssued] = useState(null); // { email, password } shown once
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    try {
      setAccounts(await getAccounts());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    if (isMaster) {
      Promise.all([getHospitals(), getBloodBanks()]).then(([h, b]) =>
        setOrgs([
          ...h.hospitals.map((x) => ({ key: `Hospital:${x._id}`, label: `${x.hos_name} (Hospital)` })),
          ...b.bloodBanks.map((x) => ({ key: `BloodBank:${x._id}`, label: `${x.bank_name} (Blood bank)` })),
        ])
      ).catch(() => {});
    }
  }, [load, isMaster]);

  const openNew = () => {
    setForm({ name: '', email: '', phone: '', role: 'STAFF', org: orgs[0]?.key || '', password: '' });
    setEditing('new');
  };
  const openEdit = (a) => {
    setForm({ name: a.name || '', phone: a.phone || '', role: a.role, password: '' });
    setEditing(a);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing === 'new') {
        const [facility_type, facility_id] = (form.org || '').split(':');
        const res = await createAccount({
          name: form.name, email: form.email, phone: form.phone || undefined, password: form.password || undefined,
          ...(isMaster ? { facility_type, facility_id } : { role: form.role }),
        });
        if (res.temporaryPassword) setIssued({ email: res.account.email, password: res.temporaryPassword });
      } else {
        await updateAccount(editing.id, {
          name: form.name, phone: form.phone, password: form.password || undefined,
          ...(editing.role !== 'ORG_ADMIN' ? { role: form.role } : {}),
        });
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteAccount(id);
      setConfirmId(null);
      await load();
    } catch (err) {
      setError(err.message);
      setConfirmId(null);
    }
  };

  const copy = async () => {
    await navigator.clipboard?.writeText(`${issued.email} / ${issued.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="w-full space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {isMaster ? 'Organization' : 'Staff'} <span className="font-serif italic font-normal text-amber-400">Accounts</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              {isMaster
                ? 'Create the admin login for each hospital and blood bank. Admins then create their own staff.'
                : 'Create and manage staff logins for your organization. Staff cannot create accounts.'}
            </p>
          </div>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 self-start md:self-auto cursor-pointer">
          <Plus className="w-4 h-4" /> {isMaster ? 'Add Organization Admin' : 'Add Staff'}
        </button>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{error}</div>}

      {issued && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-100 text-xs flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Account created – share these credentials now, the password is shown only once.</p>
            <p className="font-mono mt-1">{issued.email} / {issued.password}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={copy} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
            <button onClick={() => setIssued(null)} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <div className="w-full rounded-2xl bg-neutral-950/80 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-neutral-400 uppercase font-mono tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Name / Email</th>
                <th className="py-3.5 px-4">Role</th>
                {isMaster && <th className="py-3.5 px-4">Organization</th>}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {loading ? (
                <tr><td colSpan="4" className="py-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-neutral-500" /></td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan="4" className="py-10 text-center text-neutral-500">No accounts yet.</td></tr>
              ) : accounts.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.03]">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{a.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{a.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${a.role === 'ORG_ADMIN' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-white/5 text-neutral-300 border-white/10'}`}>
                      {a.role === 'ORG_ADMIN' ? 'ADMIN' : a.role}
                    </span>
                  </td>
                  {isMaster && <td className="py-3.5 px-4">{a.facilityName} <span className="text-neutral-500">({a.facilityType === 'Hospital' ? 'Hospital' : 'Blood bank'})</span></td>}
                  <td className="py-3.5 px-4 text-right">
                    {a.manageable ? (
                      confirmId === a.id ? (
                        <span className="inline-flex items-center gap-1">
                          <button onClick={() => remove(a.id)} className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold cursor-pointer">Confirm</button>
                          <button onClick={() => setConfirmId(null)} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <button onClick={() => openEdit(a)} title="Edit" className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setConfirmId(a.id)} title="Delete" className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </span>
                      )
                    ) : <span className="text-[10px] text-neutral-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !saving && setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-neutral-950 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{editing === 'new' ? (isMaster ? 'Add Organization Admin' : 'Add Staff') : 'Edit Account'}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-neutral-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            {editing === 'new' && isMaster && (
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Organization *</label>
                <select required value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} className={inputCls}>
                  {orgs.map((o) => <option key={o.key} value={o.key} className="bg-neutral-900">{o.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Full name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            {editing === 'new' && (
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Login email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
            )}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </div>
            {!isMaster && (editing === 'new' || editing.role !== 'ORG_ADMIN') && (
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                  {STAFF_ROLES.map((r) => <option key={r} value={r} className="bg-neutral-900">{r}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">
                {editing === 'new' ? 'Password (leave empty to generate one)' : 'New password (leave empty to keep)'}
              </label>
              <input type="text" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} {editing === 'new' ? 'Create account' : 'Save changes'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default AccountsPage;
