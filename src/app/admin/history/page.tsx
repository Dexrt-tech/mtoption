'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search, Edit2, Trash2, PlusCircle, X, RefreshCw, History,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Tx {
  _id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  note?: string;
  createdAt: string;
}

const TX_TYPES = ['deposit', 'withdrawal', 'earning', 'bonus'];
const TX_STATUSES = ['pending', 'approved', 'rejected', 'completed'];

const typeColor = (t: string) =>
  t === 'deposit' ? '#22c55e' : t === 'withdrawal' ? '#ef4444' : t === 'bonus' ? '#f59e0b' : '#60a5fa';

const statusStyle = (s: string) =>
  s === 'approved' || s === 'completed'
    ? { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' }
    : s === 'pending'
    ? { bg: 'rgba(234,179,8,0.1)', color: '#eab308' }
    : { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };

const inputCls = 'w-full rounded-lg border px-3 py-2 text-sm text-white bg-transparent focus:outline-none focus:border-primary';
const inputStyle = { borderColor: '#1d222b' };

export default function AdminHistoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [editingTx, setEditingTx] = useState<Tx | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: 'deposit', amount: '', status: 'approved', currency: 'USD', note: '', createdAt: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { if (d.users) setUsers(d.users); });
  }, []);

  const fetchTxs = useCallback((userId: string) => {
    setLoadingTxs(true);
    fetch(`/api/admin/transactions?userId=${userId}`)
      .then(r => r.json())
      .then(d => { if (d.transactions) setTxs(d.transactions); else setTxs([]); })
      .finally(() => setLoadingTxs(false));
  }, []);

  const selectUser = (u: User) => {
    setSelectedUser(u);
    setEditingTx(null);
    setAdding(false);
    fetchTxs(u._id);
  };

  const startEdit = (tx: Tx) => {
    setAdding(false);
    setEditingTx(tx);
    setForm({
      type: tx.type,
      amount: tx.amount.toString(),
      status: tx.status,
      currency: tx.currency || 'USD',
      note: tx.note || '',
      createdAt: tx.createdAt ? new Date(tx.createdAt).toISOString().slice(0, 16) : '',
    });
  };

  const startAdd = () => {
    setEditingTx(null);
    setAdding(true);
    setForm({ type: 'deposit', amount: '', status: 'approved', currency: 'USD', note: '', createdAt: '' });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    const amtNum = parseFloat(form.amount);
    if (isNaN(amtNum) || amtNum <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    try {
      if (adding) {
        const res = await fetch('/api/admin/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUser._id, type: form.type, amount: amtNum, status: form.status, currency: form.currency, note: form.note }),
        });
        const d = await res.json();
        if (!res.ok) { toast.error(d.error || 'Failed'); return; }
        toast.success('Transaction added');
      } else if (editingTx) {
        const res = await fetch('/api/admin/transactions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txId: editingTx._id, type: form.type, amount: amtNum, status: form.status, currency: form.currency, note: form.note, createdAt: form.createdAt || undefined }),
        });
        const d = await res.json();
        if (!res.ok) { toast.error(d.error || 'Failed'); return; }
        toast.success('Transaction updated');
      }
      setEditingTx(null);
      setAdding(false);
      fetchTxs(selectedUser._id);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (txId: string) => {
    if (!confirm('Delete this transaction?')) return;
    const res = await fetch('/api/admin/transactions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txId }),
    });
    if (res.ok) {
      toast.success('Deleted');
      if (selectedUser) fetchTxs(selectedUser._id);
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History size={22} style={{ color: 'var(--primary)' }} />
          Transaction History
        </h1>
        <p className="text-sm mt-1" style={{ color: '#62748e' }}>View and edit every user&apos;s transaction records</p>
      </div>

      <div className="flex gap-5 flex-col lg:flex-row" style={{ minHeight: '70vh' }}>
        {/* Left: User list */}
        <div className="w-full lg:w-72 shrink-0 rounded-2xl border flex flex-col" style={{ background: '#03060d', borderColor: '#1d222b', maxHeight: '80vh' }}>
          <div className="px-4 pt-4 pb-3 border-b shrink-0" style={{ borderColor: '#1d222b' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#62748e' }}>Select User</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#62748e' }} />
              <input
                type="text"
                className="w-full rounded-lg border py-2 pl-8 pr-3 text-sm text-white bg-transparent placeholder:text-[#42526b] focus:outline-none"
                style={{ borderColor: '#1d222b' }}
                placeholder="Search users…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 py-2">
            {filteredUsers.map(u => (
              <button
                key={u._id}
                onClick={() => selectUser(u)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/[0.03]"
                style={selectedUser?._id === u._id ? { background: 'rgba(255,106,94,0.08)', borderLeft: '2px solid var(--primary)' } : { borderLeft: '2px solid transparent' }}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(255,106,94,0.15)', color: 'var(--primary)' }}>
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-xs truncate" style={{ color: '#62748e' }}>{u.email}</p>
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <p className="py-8 text-center text-xs" style={{ color: '#62748e' }}>No users found</p>
            )}
          </div>
        </div>

        {/* Right: Transactions panel */}
        <div className="flex-1 rounded-2xl border flex flex-col" style={{ background: '#03060d', borderColor: '#1d222b', minHeight: '400px', maxHeight: '80vh' }}>
          {!selectedUser ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <History size={40} style={{ color: '#1d222b', margin: '0 auto 12px' }} />
                <p className="text-sm" style={{ color: '#62748e' }}>Select a user to view their transaction history</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4 shrink-0" style={{ borderColor: '#1d222b' }}>
                <div>
                  <p className="text-sm font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-xs" style={{ color: '#62748e' }}>{selectedUser.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={startAdd} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <PlusCircle size={13} /> Add Transaction
                  </button>
                  <button onClick={() => fetchTxs(selectedUser._id)} className="rounded-lg p-2 hover:bg-white/5 transition-colors" style={{ color: '#62748e' }} title="Refresh">
                    <RefreshCw size={14} className={loadingTxs ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Edit / Add form */}
              {(editingTx || adding) && (
                <div className="border-b px-6 py-4 shrink-0 space-y-3" style={{ borderColor: '#1d222b', background: '#060a12' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#62748e' }}>
                      {adding ? 'Add Transaction' : 'Edit Transaction'}
                    </p>
                    <button onClick={() => { setEditingTx(null); setAdding(false); }} style={{ color: '#62748e' }} className="hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#62748e' }}>Type</label>
                      <select className={inputCls} style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        {TX_TYPES.map(t => <option key={t} value={t} style={{ background: '#03060d' }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#62748e' }}>Status</label>
                      <select className={inputCls} style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        {TX_STATUSES.map(s => <option key={s} value={s} style={{ background: '#03060d' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#62748e' }}>Amount ($)</label>
                      <input type="number" className={inputCls} style={inputStyle} placeholder="0.00" value={form.amount} min="0" step="0.01" onChange={e => setForm({ ...form, amount: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#62748e' }}>Currency</label>
                      <input className={inputCls} style={inputStyle} placeholder="USD" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#62748e' }}>Date &amp; Time</label>
                      <input type="datetime-local" className={inputCls} style={inputStyle} value={form.createdAt} onChange={e => setForm({ ...form, createdAt: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: '#62748e' }}>Note (optional)</label>
                      <input className={inputCls} style={inputStyle} placeholder="Admin note…" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingTx(null); setAdding(false); }} className="btn-ghost text-xs px-3 py-1.5">Cancel</button>
                    <button onClick={handleSave} disabled={saving || !form.amount} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50">
                      {saving ? 'Saving…' : adding ? 'Add Transaction' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-auto flex-1">
                {loadingTxs ? (
                  <div className="py-16 text-center text-sm" style={{ color: '#62748e' }}>Loading…</div>
                ) : txs.length === 0 ? (
                  <div className="py-16 text-center text-sm" style={{ color: '#62748e' }}>No transactions found for this user.</div>
                ) : (
                  <table className="w-full">
                    <thead className="sticky top-0" style={{ background: '#03060d' }}>
                      <tr className="border-b" style={{ borderColor: '#1d222b' }}>
                        {['Type', 'Amount', 'Status', 'Date & Time', 'Currency', 'Note', ''].map(h => (
                          <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#62748e' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {txs.map(tx => {
                        const ss = statusStyle(tx.status);
                        return (
                          <tr key={tx._id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#1d222b' }}>
                            <td className="px-5 py-3">
                              <span className="text-xs font-semibold" style={{ color: typeColor(tx.type) }}>
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-sm font-bold text-white">
                              ${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-5 py-3">
                              <span className="text-xs rounded-full px-2.5 py-0.5 font-medium" style={{ background: ss.bg, color: ss.color }}>
                                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs whitespace-nowrap" style={{ color: '#62748e' }}>
                              {new Date(tx.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </td>
                            <td className="px-5 py-3 text-xs" style={{ color: '#62748e' }}>{tx.currency || 'USD'}</td>
                            <td className="px-5 py-3 text-xs max-w-[140px] truncate" style={{ color: '#62748e' }}>{tx.note || '—'}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => startEdit(tx)}
                                  className="hover:text-white transition-colors"
                                  style={{ color: '#62748e' }}
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(tx._id)}
                                  className="text-red-500 hover:text-red-400 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
