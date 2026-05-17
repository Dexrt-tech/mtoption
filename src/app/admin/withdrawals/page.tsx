'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Withdrawal {
  _id: string;
  userId: { firstName: string; lastName: string; email: string };
  amount: number;
  currency: string;
  walletAddress: string;
  network?: string;
  status: string;
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState<string | null>(null);

  const fetchWithdrawals = () => {
    fetch('/api/admin/withdrawals').then(r => r.json()).then(d => { if (d.withdrawals) setWithdrawals(d.withdrawals); });
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const handleAction = async (transactionId: string, action: 'approve' | 'reject') => {
    setLoading(transactionId + action);
    const res = await fetch('/api/admin/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, action }),
    });
    const data = await res.json();
    if (res.ok) toast.success(data.message);
    else toast.error(data.error);
    setLoading(null);
    fetchWithdrawals();
  };

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter);
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length;

  const statusStyle = (s: string) => s === 'approved'
    ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
    : s === 'pending'
    ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
    : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Withdrawals</h1>
          <p className="text-sm" style={{ color: '#62748e' }}>{pendingCount} pending processing</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-all"
              style={filter === f
                ? { background: 'rgba(255,106,94,0.1)', color: 'var(--primary)', borderColor: 'rgba(255,106,94,0.3)' }
                : { color: '#62748e', borderColor: '#1d222b' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: '#1d222b' }}>
                {['User', 'Amount', 'Wallet Address', 'Network', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="whitespace-nowrap px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: '#62748e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w._id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: '#1d222b' }}>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{w.userId?.firstName} {w.userId?.lastName}</p>
                    <p className="text-xs" style={{ color: '#62748e' }}>{w.userId?.email}</p>
                  </td>
                  <td className="px-5 py-4"><span className="font-bold text-red-400">${w.amount.toFixed(2)}</span></td>
                  <td className="max-w-[160px] px-5 py-4">
                    <span className="block truncate font-mono text-xs" style={{ color: '#62748e' }} title={w.walletAddress}>
                      {w.walletAddress.slice(0, 16)}...
                    </span>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs" style={{ color: '#62748e' }}>{w.network || '—'}</span></td>
                  <td className="px-5 py-4">
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={statusStyle(w.status)}>{w.status}</span>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs" style={{ color: '#62748e' }}>{new Date(w.createdAt).toLocaleDateString()}</span></td>
                  <td className="px-5 py-4">
                    {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(w._id, 'approve')} disabled={!!loading} className="rounded-lg p-1.5 text-green-400 transition-colors hover:bg-green-400/10" title="Approve & send">
                          <CheckCircle size={16} />
                        </button>
                        <button onClick={() => handleAction(w._id, 'reject')} disabled={!!loading} className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-400/10" title="Reject & refund">
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm" style={{ color: '#62748e' }}>No withdrawals found.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
