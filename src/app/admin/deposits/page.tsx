'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, XCircle, Clock, ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Deposit {
  _id: string;
  userId: { firstName: string; lastName: string; email: string };
  amount: number;
  currency: string;
  paymentMethod?: string;
  txHash?: string;
  network?: string;
  screenshot?: string;
  status: string;
  createdAt: string;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const fetchDeposits = () => {
    fetch('/api/admin/deposits').then(r => r.json()).then(d => { if (d.deposits) setDeposits(d.deposits); });
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleAction = async (transactionId: string, action: 'approve' | 'reject') => {
    setLoading(transactionId + action);
    const res = await fetch('/api/admin/deposits', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, action }),
    });
    const data = await res.json();
    if (res.ok) toast.success(data.message);
    else toast.error(data.error);
    setLoading(null);
    fetchDeposits();
  };

  const filtered = filter === 'all' ? deposits : deposits.filter(d => d.status === filter);
  const pendingCount = deposits.filter(d => d.status === 'pending').length;

  const statusStyle = (s: string) => s === 'approved'
    ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
    : s === 'pending'
    ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }
    : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' };

  return (
    <AdminLayout>
      {/* Proof image lightbox */}
      {proofUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setProofUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl w-full rounded-2xl overflow-hidden"
            style={{ background: '#03060d', border: '1px solid #1d222b' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#1d222b' }}>
              <p className="text-sm font-semibold text-white">Proof of Payment</p>
              <button
                onClick={() => setProofUrl(null)}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                style={{ color: '#62748e' }}
              >
                <X size={16} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proofUrl}
              alt="Proof of payment"
              className="w-full object-contain max-h-[75vh]"
            />
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Deposits</h1>
          <p className="text-sm" style={{ color: '#62748e' }}>{pendingCount} pending review</p>
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
                {['User', 'Amount', 'Method', 'Proof', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="whitespace-nowrap px-5 py-4 text-left text-xs uppercase tracking-wider" style={{ color: '#62748e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((dep) => (
                <tr key={dep._id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: '#1d222b' }}>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">{dep.userId?.firstName} {dep.userId?.lastName}</p>
                    <p className="text-xs" style={{ color: '#62748e' }}>{dep.userId?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-green-400">${dep.amount.toFixed(2)}</span>
                    <p className="text-xs mt-0.5" style={{ color: '#62748e' }}>{dep.currency}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-white">{dep.paymentMethod || dep.network || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    {dep.screenshot ? (
                      <button
                        onClick={() => setProofUrl(dep.screenshot!)}
                        className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-white/5"
                        style={{ borderColor: 'rgba(255,106,94,0.3)', color: 'var(--primary)' }}
                      >
                        <ImageIcon size={12} />
                        View
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: '#62748e' }}>No file</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={statusStyle(dep.status)}>
                      {dep.status === 'pending' && <Clock size={10} className="mr-1 inline" />}
                      {dep.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs" style={{ color: '#62748e' }}>{new Date(dep.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-5 py-4">
                    {dep.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(dep._id, 'approve')}
                          disabled={!!loading}
                          className="rounded-lg p-1.5 text-green-400 transition-colors hover:bg-green-400/10"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(dep._id, 'reject')}
                          disabled={!!loading}
                          className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-400/10"
                          title="Reject"
                        >
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
              <p className="text-sm" style={{ color: '#62748e' }}>No deposits found.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
