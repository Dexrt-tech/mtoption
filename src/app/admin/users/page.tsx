'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search, UserCheck, UserX, Edit2, X,
  DollarSign, TrendingUp, TrendingDown, Plus, Minus, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarnings: number;
  isActive: boolean;
  isVerified: boolean;
  role: string;
  createdAt: string;
}

type BalanceTab = 'set' | 'credit' | 'deduct';

function EditUserModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const [tab, setTab] = useState<BalanceTab>('set');
  const [amount, setAmount] = useState('');
  const [totalDeposited, setTotalDeposited] = useState(String(user.totalDeposited));
  const [totalWithdrawn, setTotalWithdrawn] = useState(String(user.totalWithdrawn));
  const [totalEarnings, setTotalEarnings] = useState(String(user.totalEarnings));
  const [saving, setSaving] = useState(false);

  const patch = async (body: Record<string, unknown>, successMsg?: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed'); return; }
      toast.success(successMsg || data.message);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleBalanceSubmit = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) { toast.error('Enter a valid amount'); return; }
    const actionMap: Record<BalanceTab, string> = {
      set: 'set-balance',
      credit: 'credit-balance',
      deduct: 'deduct-balance',
    };
    const msgMap: Record<BalanceTab, string> = {
      set: `Balance set to $${val.toFixed(2)}`,
      credit: `$${val.toFixed(2)} credited`,
      deduct: `$${val.toFixed(2)} deducted`,
    };
    await patch({ action: actionMap[tab], amount: val }, msgMap[tab]);
    setAmount('');
  };

  const handleStatsSubmit = async () => {
    const dep = parseFloat(totalDeposited);
    const wit = parseFloat(totalWithdrawn);
    const ear = parseFloat(totalEarnings);
    if ([dep, wit, ear].some(isNaN)) { toast.error('All stat fields must be valid numbers'); return; }
    await patch({ action: 'update-stats', totalDeposited: dep, totalWithdrawn: wit, totalEarnings: ear }, 'Stats updated');
  };

  const tabCls = (t: BalanceTab) =>
    `flex-1 py-2 text-xs font-semibold rounded transition-all ${tab === t
      ? 'text-white'
      : 'text-[#62748e] hover:text-white'
    }`;
  const tabStyle = (t: BalanceTab) => tab === t
    ? t === 'credit'
      ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e' }
      : t === 'deduct'
      ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444' }
      : { background: 'rgba(255,106,94,0.15)', color: 'var(--primary)' }
    : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl border" style={{ background: '#03060d', borderColor: '#1d222b' }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: '#1d222b' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'rgba(255,106,94,0.15)', color: 'var(--primary)' }}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user.firstName} {user.lastName}</p>
              <p className="text-xs" style={{ color: '#62748e' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-white/5" style={{ color: '#62748e' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Current balance display */}
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,106,94,0.06)', border: '1px solid rgba(255,106,94,0.15)' }}>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#62748e' }}>Current Balance</p>
            <p className="text-3xl font-black text-white">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          {/* Balance adjustment */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#62748e' }}>Adjust Balance</p>

            {/* Tabs */}
            <div className="mb-3 flex gap-1 rounded-lg p-1" style={{ background: '#0a0f1a' }}>
              {(['set', 'credit', 'deduct'] as BalanceTab[]).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={tabCls(t)} style={tabStyle(t)}>
                  {t === 'set' ? 'Set Exact' : t === 'credit' ? '+ Credit' : '− Deduct'}
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs" style={{ color: '#62748e' }}>
              {tab === 'set' && 'Set the balance to this exact amount'}
              {tab === 'credit' && 'Add this amount to the current balance'}
              {tab === 'deduct' && 'Subtract this amount from the current balance'}
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#62748e' }}>$</span>
                <input
                  type="number"
                  className="input-field w-full pl-8"
                  placeholder="0.00"
                  value={amount}
                  min="0"
                  step="0.01"
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleBalanceSubmit()}
                />
              </div>
              <button
                onClick={handleBalanceSubmit}
                disabled={saving || !amount}
                className="btn-primary px-4 disabled:opacity-50"
                style={tab === 'credit' ? { background: '#16a34a' } : tab === 'deduct' ? { background: '#dc2626' } : {}}
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : tab === 'set' ? <DollarSign size={14} /> : tab === 'credit' ? <Plus size={14} /> : <Minus size={14} />}
              </button>
            </div>
          </div>

          {/* Stats editor */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#62748e' }}>Edit Account Stats</p>
            <div className="space-y-3">
              {[
                { label: 'Total Deposited', value: totalDeposited, set: setTotalDeposited, icon: <TrendingUp size={13} className="text-green-400" /> },
                { label: 'Total Withdrawn', value: totalWithdrawn, set: setTotalWithdrawn, icon: <TrendingDown size={13} className="text-red-400" /> },
                { label: 'Total Earnings', value: totalEarnings, set: setTotalEarnings, icon: <DollarSign size={13} style={{ color: 'var(--primary)' }} /> },
              ].map(({ label, value, set, icon }) => (
                <div key={label}>
                  <label className="mb-1 flex items-center gap-1.5 text-xs" style={{ color: '#62748e' }}>
                    {icon}{label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#62748e' }}>$</span>
                    <input
                      type="number"
                      className="input-field w-full pl-8"
                      value={value}
                      min="0"
                      step="0.01"
                      onChange={(e) => set(e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleStatsSubmit}
              disabled={saving}
              className="btn-primary mt-3 w-full disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Stats'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch('/api/admin/users').then(r => r.json()).then(d => { if (d.users) setUsers(d.users); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (user: User) => {
    setTogglingId(user._id);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, action: 'toggle-active' }),
    });
    const data = await res.json();
    toast.success(data.message);
    setTogglingId(null);
    fetchUsers();
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Users</h1>
          <p className="text-sm" style={{ color: '#62748e' }}>{users.length} total users registered</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#62748e' }} />
          <input
            type="text"
            className="input-field w-64 pl-9"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#1d222b' }}>
                {['User', 'Balance', 'Deposited', 'Withdrawn', 'Earnings', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="whitespace-nowrap px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: '#62748e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: '#1d222b' }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: 'rgba(255,106,94,0.15)', color: 'var(--primary)' }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs" style={{ color: '#62748e' }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-white">${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-5 py-4"><span className="text-sm text-green-400">${user.totalDeposited.toFixed(2)}</span></td>
                  <td className="px-5 py-4"><span className="text-sm text-red-400">${user.totalWithdrawn.toFixed(2)}</span></td>
                  <td className="px-5 py-4"><span className="text-sm" style={{ color: 'var(--primary)' }}>${(user.totalEarnings || 0).toFixed(2)}</span></td>
                  <td className="px-5 py-4">
                    <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={user.isActive
                      ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                      : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                    }>
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs" style={{ color: '#62748e' }}>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditUser(user)}
                        className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5"
                        style={{ borderColor: '#1d222b', color: '#c4c4c4' }}
                        title="Edit balance & stats"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={togglingId === user._id}
                        className={`rounded-lg p-1.5 transition-colors ${user.isActive ? 'text-amber-400 hover:bg-amber-400/10' : 'hover:bg-[rgba(255,106,94,0.1)]'}`}
                        style={user.isActive ? undefined : { color: 'var(--primary)' }}
                        title={user.isActive ? 'Suspend user' : 'Activate user'}
                      >
                        {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: '#62748e' }}>No users found.</p>
            </div>
          )}
        </div>
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { fetchUsers(); setEditUser(null); }}
        />
      )}
    </AdminLayout>
  );
}
