'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, XCircle, Clock, Eye, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface KYCSubmission {
  _id: string;
  userId: { firstName: string; lastName: string; email: string };
  status: 'pending' | 'approved' | 'rejected';
  nameOnId: string;
  idType: 'passport' | 'drivers_license' | 'national_id';
  govIdFrontUrl: string;
  govIdBackUrl?: string;
  proofOfAddressUrl: string;
  selfieUrl: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

const ID_LABELS: Record<string, string> = {
  passport: 'Passport',
  drivers_license: "Driver's License",
  national_id: 'National ID',
};

export default function AdminKYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState<string | null>(null);
  const [viewing, setViewing] = useState<KYCSubmission | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const fetchData = () => {
    fetch('/api/admin/kyc')
      .then(r => r.json())
      .then(d => { if (d.submissions) setSubmissions(d.submissions); });
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.status === filter);
  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  const normName = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
  const nameMismatch = (sub: KYCSubmission) => {
    const accountName = `${sub.userId.firstName} ${sub.userId.lastName}`;
    return normName(sub.nameOnId) !== normName(accountName);
  };

  async function handleAction(kycId: string, action: 'approve' | 'reject') {
    if (action === 'reject' && !rejectReason.trim()) {
      toast.error('Please enter a rejection reason');
      return;
    }
    setLoading(kycId + action);
    const res = await fetch('/api/admin/kyc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kycId, action, rejectionReason: rejectReason }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      setViewing(null);
      setShowRejectInput(false);
      setRejectReason('');
    } else {
      toast.error(data.error);
    }
    setLoading(null);
    fetchData();
  }

  const statusStyle = (s: string) =>
    s === 'approved'
      ? { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' }
      : s === 'pending'
      ? { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' }
      : { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' };

  return (
    <AdminLayout>
      {/* Image preview lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full p-2 hover:bg-white/10"
            style={{ color: '#fff' }}
            onClick={() => setPreviewUrl(null)}
          >
            <X size={22} />
          </button>
          <img src={previewUrl} alt="Document" className="max-h-[85vh] max-w-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Review modal */}
      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => { setViewing(null); setShowRejectInput(false); setRejectReason(''); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border overflow-y-auto"
            style={{ background: '#0d1117', borderColor: '#1d222b', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1d222b' }}>
              <div>
                <h2 className="text-base font-bold text-white">KYC Review</h2>
                <p className="text-xs text-slate-500">{viewing.userId.firstName} {viewing.userId.lastName} · {viewing.userId.email}</p>
              </div>
              <button onClick={() => { setViewing(null); setShowRejectInput(false); setRejectReason(''); }} style={{ color: '#62748e' }}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name check */}
              <div className="rounded-lg p-3 space-y-1.5" style={{ background: '#111' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Account name</span>
                  <span className="text-white font-medium">{viewing.userId.firstName} {viewing.userId.lastName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Name on ID</span>
                  <span className={`font-medium ${nameMismatch(viewing) ? 'text-amber-400' : 'text-white'}`}>{viewing.nameOnId}</span>
                </div>
                {nameMismatch(viewing) && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-amber-400">
                    <AlertTriangle size={13} />
                    Names don't match — verify manually
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">ID Type</span>
                  <span className="text-white">{ID_LABELS[viewing.idType]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Submitted</span>
                  <span className="text-white">{new Date(viewing.submittedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                </div>
              </div>

              {/* Document thumbnails */}
              <div className="grid grid-cols-2 gap-3">
                <DocThumb label="Gov ID (Front)" url={viewing.govIdFrontUrl} onClick={() => setPreviewUrl(viewing.govIdFrontUrl)} />
                {viewing.govIdBackUrl && (
                  <DocThumb label="Gov ID (Back)" url={viewing.govIdBackUrl} onClick={() => setPreviewUrl(viewing.govIdBackUrl!)} />
                )}
                <DocThumb label="Proof of Address" url={viewing.proofOfAddressUrl} onClick={() => setPreviewUrl(viewing.proofOfAddressUrl)} />
                <DocThumb label="Selfie with ID" url={viewing.selfieUrl} onClick={() => setPreviewUrl(viewing.selfieUrl)} />
              </div>

              {/* Rejection reason if already rejected */}
              {viewing.status === 'rejected' && viewing.rejectionReason && (
                <div className="rounded-lg p-3 text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-red-400 font-medium mb-0.5">Rejection reason</p>
                  <p className="text-slate-400">{viewing.rejectionReason}</p>
                </div>
              )}

              {/* Reject input */}
              {showRejectInput && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Rejection reason (shown to user)</label>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. ID image is blurry or expired. Please resubmit a clear photo."
                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none resize-none"
                    style={{ borderColor: 'rgba(239,68,68,0.4)' }}
                  />
                </div>
              )}

              {/* Actions */}
              {viewing.status === 'pending' && (
                <div className="flex gap-3 pt-1">
                  {!showRejectInput ? (
                    <>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                      >
                        <XCircle size={15} /> Reject
                      </button>
                      <button
                        onClick={() => handleAction(viewing._id, 'approve')}
                        disabled={loading === viewing._id + 'approve'}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: '#22c55e' }}
                      >
                        <CheckCircle size={15} />
                        {loading === viewing._id + 'approve' ? 'Approving…' : 'Approve'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                        className="flex-1 rounded-lg border py-2.5 text-sm text-slate-300 hover:bg-white/5"
                        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction(viewing._id, 'reject')}
                        disabled={!rejectReason.trim() || loading === viewing._id + 'reject'}
                        className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        style={{ background: '#ef4444' }}
                      >
                        {loading === viewing._id + 'reject' ? 'Rejecting…' : 'Confirm Reject'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">KYC Verifications</h1>
            <p className="text-sm text-slate-500 mt-0.5">{pendingCount} pending review{pendingCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={filter === f
                  ? { background: 'rgba(255,106,94,0.12)', color: 'var(--primary)', border: '1px solid rgba(255,106,94,0.2)' }
                  : { background: 'transparent', color: '#62748e', border: '1px solid #1d222b' }}
              >
                {f === 'all' ? `All (${submissions.length})` : `${f} (${submissions.filter(s => s.status === f).length})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">No {filter === 'all' ? '' : filter} submissions</div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1d222b' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: '#0a0e14', borderBottom: '1px solid #1d222b' }}>
                  {['User', 'ID Type', 'Name on ID', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#62748e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => {
                  const ss = statusStyle(sub.status);
                  const mismatch = nameMismatch(sub);
                  return (
                    <tr key={sub._id} style={{ borderBottom: '1px solid #1d222b', background: '#03060d' }}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{sub.userId.firstName} {sub.userId.lastName}</p>
                        <p className="text-xs text-slate-500">{sub.userId.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{ID_LABELS[sub.idType]}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-300">{sub.nameOnId}</span>
                        {mismatch && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <AlertTriangle size={11} className="text-amber-400" />
                            <span className="text-xs text-amber-400">Name mismatch</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setViewing(sub); setShowRejectInput(false); setRejectReason(''); }}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <Eye size={13} /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function DocThumb({ label, url, onClick }: { label: string; url: string; onClick: () => void }) {
  const isPdf = url.toLowerCase().includes('.pdf') || url.includes('pdf');
  return (
    <div className="cursor-pointer rounded-xl overflow-hidden border group" style={{ borderColor: 'rgba(255,255,255,0.08)' }} onClick={onClick}>
      {isPdf ? (
        <div className="flex h-28 items-center justify-center bg-zinc-900">
          <div className="text-center">
            <div className="text-2xl mb-1">📄</div>
            <p className="text-xs text-slate-500">PDF Document</p>
          </div>
        </div>
      ) : (
        <div className="relative h-28 overflow-hidden bg-zinc-900">
          <img src={url} alt={label} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <Eye size={20} className="text-white" />
          </div>
        </div>
      )}
      <div className="px-2.5 py-1.5" style={{ background: '#111' }}>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}
